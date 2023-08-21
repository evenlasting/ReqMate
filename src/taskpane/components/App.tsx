import * as React from "react";
import Progress from "./Progress";
import { InputBox } from "./InputBox";
import { ResultsList } from "./ResultsList";
import { ChartKeyColor, extractKeyColor, extractKeyInfo } from "../util/util";
import { gptPalette } from "../palette/palette";

/* global require console */

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {
  submitting: boolean;
  extractedKeyColors: ChartKeyColor;
  recommendedKeyColorList: string[][];
  openAIKey: string;
  errorInfo: string | null;
  // newOrRefine: "new" | "refine";
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      submitting: false,
      extractedKeyColors: { seriesColor: [] },
      recommendedKeyColorList: [],
      openAIKey: "",
      errorInfo: null,
      // newOrRefine: "refine",
    };
  }

  componentDidMount() {
    // extractKeyColor()
    //   .then((extractedKeyColors) =>
    //     this.setState({ extractedKeyColors: combineColor(extractedKeyColors), submitting: false })
    //   )
    //   .catch((error) => {
    //     this.setState({ submitting: false, errorInfo: error.message });
    //   });
  }

  extractSubmit = async (prompt, openAIKey) => {
    this.setState({ submitting: true, errorInfo: null });
    let extractedKeyColors;
    // try {
      extractedKeyColors = await extractKeyInfo();
    // } catch (error) {
    //   this.setState({ submitting: false, errorInfo: error.message });
    // }
    // 对颜色做合并
    const uniqueExtractedKeyColors = combineColor(extractedKeyColors);
    this.setState({ extractedKeyColors, openAIKey });

    gptPalette(prompt, uniqueExtractedKeyColors.seriesColor, openAIKey)
      .then((resultList) => {
        console.log(resultList);
        const uniqueRecommendedKeyColorList = resultList;
        const recommendedKeyColorList = uniqueRecommendedKeyColorList.map((uniqueRecommendedKeyColor) => {
          return extractedKeyColors.seriesColor.map((color) => {
            const index = uniqueExtractedKeyColors.seriesColor.indexOf(color);
            return uniqueRecommendedKeyColor[index];
          });
        });
        this.setState({ recommendedKeyColorList }); //解压之后再set，画出来之前合并一下
        this.setState({ submitting: false });
      })
      .catch((err) => {
        if (!this.state.openAIKey.startsWith("sk"))
          this.setState({ submitting: false, errorInfo: "GPT error: please enter key in setting." });
        else this.setState({ submitting: false, errorInfo: err.message });
      });
  };

  handleNewOrRefineChange = () => {
    // this.setState({ newOrRefine: this.state.newOrRefine === "refine" ? "new" : "refine" });
  };

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress
          title={title}
          logo={require("./../../../assets/logo-filled.png")}
          message="Please sideload your addin to see app body."
        />
      );
    }

    return (
      <div className="ms-welcome">
        <InputBox onSubmit={this.extractSubmit} submitting={this.state.submitting} errorInfo={this.state.errorInfo} />
        <ResultsList
          keyColors={this.state.extractedKeyColors.seriesColor}
          results={this.state.recommendedKeyColorList}
        />
      </div>
    );
  }
}

const combineColor = (chartKeyColor: ChartKeyColor) => {
  const color = chartKeyColor.seriesColor;
  const uniqueColorSet = new Set(color);
  const uniqueColorList = Array.from(uniqueColorSet);
  return { seriesColor: uniqueColorList } as ChartKeyColor;
};
