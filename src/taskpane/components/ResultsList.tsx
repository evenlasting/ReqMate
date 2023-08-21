import React, { useState } from "react";
import { Stack, mergeStyles, ActionButton } from "@fluentui/react";
import { updateKeyColor } from "../util/util";

/* global console */

interface ResultsListProps {
  keyColors: string[];
  results: string[][];
}

const circleList = (colorListString: string | string[]) => {
  let colorList;
  if (typeof colorListString === "string") colorList = colorListString.split(",");
  else colorList = colorListString;
  // colorList=
  const circleStyle = (colorString: string) =>
    mergeStyles({
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      backgroundColor: colorString,
      marginRight: "8px",
      border: "1px solid black",
    });
  console.log(colorList, "color");
  return (
    <Stack horizontal>
      {/* {combineColorList(colorList)?.map((color, index) => {
        return <div className={circleStyle(color)} key={index}></div>;
      })} */}
      {colorList.map((color, index) => {
        return <div className={circleStyle(color)} key={index}></div>;
      })}
    </Stack>
  );
};

const setColor = (keyColors, colorString: string | string[]) => {
  updateKeyColor(keyColors, colorString);
};

export const ResultsList: React.FC<ResultsListProps> = ({ keyColors, results }) => {
  const [selectedColorChoice, setSelectedColorChoice] = useState([false, false, false, false, false]);
  const [isInitColor, setIsInitColor] = useState(true);
  console.log(results);
  // const IsinitColor = () => selectedColorChoice.some((selected) => selected);
  const renderItem = (result: string | string[], index: number) => {
    return (
      <Stack horizontal verticalAlign="center" key={index}>
        {/* {circleList(result)} */ result}
        <ActionButton
          style={{ color: selectedColorChoice[index] ? "grey" : "#106EBE" }}
          onClick={() => {
            setColor(keyColors, result);
            let selectedColorChoice = [false, false, false, false, false];
            selectedColorChoice[index] = true;
            setSelectedColorChoice(selectedColorChoice);
            setIsInitColor(false);
          }}
        >
          Preview
        </ActionButton>
      </Stack>
    );
  };

  return (
    <Stack>
      <Stack horizontalAlign="center">
        {/* <b className="b"> Extracted Key Colors</b>
        <Stack horizontal verticalAlign="center">
          {circleList(keyColors)}{" "}
          <ActionButton
            style={{ color: isInitColor ? "grey" : "#106EBE" }}
            onClick={() => {
              setIsInitColor(true);
              setSelectedColorChoice([false, false, false, false, false]);
              setColor(keyColors, keyColors);
            }}
          >
            Recover
          </ActionButton>
        </Stack> */}
        <b> Improvements </b>
        <Stack>{["调整Position index 0", "调整fontSize index 0", "调整content index 0"].map(renderItem)}</Stack>
      </Stack>
    </Stack>
  );
};

// const combineColorList = (chartKeyColorList: string[]) => {
//   const uniqueColorSet = new Set(chartKeyColorList);
//   const uniqueColorList = Array.from(uniqueColorSet);
//   return uniqueColorList;
// };
