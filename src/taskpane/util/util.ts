/* eslint-disable office-addins/call-sync-before-read */
/* global console, Excel, PowerPoint, Office */

type Color = string;

export interface ChartKeyColor {
  seriesColor: Color[];
}

const extractStackedColor = async (chart: Excel.Chart, context) => {
  const chartKeyColor = { seriesColor: [] } as ChartKeyColor;
  chart.load("series/items");
  await context.sync();
  const color = chart.series.items.map((item) => {
    return item.format.fill.getSolidColor(); //需要最新的excel 4月份之後才更新的這個api
  });
  await context.sync();
  chartKeyColor.seriesColor = color.map((clientResult) => clientResult.value);
  return chartKeyColor;
};

const updateStackedColor = async (chart, context, newChartKeyColor) => {
  chart.load("series/items");

  await context.sync();

  chart.series.items.forEach((item, index: number) => {
    // if (chartKeyColor[index] !== newChartKeyColor[index]) {
    item.format.fill.setSolidColor(newChartKeyColor[index]);
    // }
  });

  await context.sync();
};

const extractPieColor = async (chart: Excel.Chart, context) => {
  const chartKeyColor = { seriesColor: [] } as ChartKeyColor;
  chart.load("series/items/points");
  await context.sync();
  const color = chart.series.items[0].points.items.map((point) => {
    return point.format.fill.getSolidColor();
  });
  await context.sync();
  chartKeyColor.seriesColor = color.map((clientResult) => clientResult.value);
  return chartKeyColor;
};

const updatePieColor = async (chart, context, newChartKeyColor) => {
  chart.load("series/items/points");

  await context.sync();

  chart.series.items[0].points.items.forEach((point, index: number) => {
    point.format.fill.setSolidColor(newChartKeyColor[index]);
  });

  await context.sync();
};

const extractLineColor = async (chart: Excel.Chart, context, marker: boolean) => {
  const chartKeyColor = { seriesColor: [] } as ChartKeyColor;
  chart.load("series/items");
  await context.sync();
  console.log(marker);
  const lines = chart.series.items.map((item) => {
    item.load("format/line");
    return item.format.line;
    // return aa.color;
  });
  await context.sync();
  chartKeyColor.seriesColor = lines.map((line) => line.color);
  return chartKeyColor;
};

const updateLineColor = async (chart: Excel.Chart, context, newChartKeyColor, marker: boolean) => {
  chart.load("series/items");
  await context.sync();

  chart.series.items.forEach((item, index) => {
    item.format.line.color = newChartKeyColor[index];
    if (marker) {
      item.markerBackgroundColor = newChartKeyColor[index];
      item.markerForegroundColor = newChartKeyColor[index];
    }
  });
  await context.sync();
};

const extractScatterColor = async (chart: Excel.Chart, context, line: boolean) => {
  const chartKeyColor = { seriesColor: [] } as ChartKeyColor;
  chart.load("series/items");
  chart.load("series/items/markerForegroundColor");
  await context.sync();
  console.log(line);
  const colors = chart.series.items.map((item) => {
    return item.markerForegroundColor;
  });
  await context.sync();
  chartKeyColor.seriesColor = colors;
  return chartKeyColor;
};

const updateScatterColor = async (chart: Excel.Chart, context, newChartKeyColor, line: boolean) => {
  chart.load("series/items");
  await context.sync();

  chart.series.items.forEach((item, index) => {
    item.markerBackgroundColor = newChartKeyColor[index];
    item.markerForegroundColor = newChartKeyColor[index];
    if (line) {
      item.format.line.color = newChartKeyColor[index];
    }
  });
  await context.sync();
};

interface Position {
  left: number;
  top: number;
  height: number;
  width: number;
}

interface TextInfo {
  textContent: string;
  fontSize: number;
  fontColor: string;
  position: Position;
}

interface ImageInfo {
  position: Position;
  base64String: string;
}

interface KeyInfo {
  textInfoList: TextInfo[];
  imageInfoList: ImageInfo[];
}

export const extractKeyInfo = async (): Promise<KeyInfo> => {
  const keyInfo = { textInfoList: [], imageInfoList: [] } as KeyInfo;

  // Office.context.document.setSelectedDataAsync(
  //   "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsK\r\nCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQU\r\nFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAJABADAREA\r\nAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgMHCP/EACUQAAEEAQMCBwAAAAAAAAAAAAECAwQF\r\nEQAGEgcxNDdhc3Sxs//EABcBAAMBAAAAAAAAAAAAAAAAAAMFBgT/xAAnEQABAwIEBQUAAAAAAAAA\r\nAAABAAIDESEEEnGREzI0grExYXKBof/aAAwDAQACEQMRAD8ALpfa2VFBdK26liOlAdczeMFsN8iA\r\noBSVcRkEA5HbQ8bNhwQDMAdKn8KosCcrXF0VR8qDYhJuJx3Nf2KLawiSYrLCVsR2JraXIzKSAQt5\r\nZwvuMEJHoDjS5mJcM2V7aXob1P0AKblbomwSPdx2kelqiw9yTfZZz2L5Ebz+cz9alJ+rj0Q4eil1\r\nCpEjwF57VZ+Wlw5m93lNhySdvhf/2Q==\r\n",
  //   { coercionType: Office.CoercionType.Image },
  //   function (asyncResult) {
  //     if (asyncResult.status === Office.AsyncResultStatus.Failed) {
  //       console.log("Error", asyncResult.error.message);
  //     }
  //   }
  // );

  // Office.context.document.getSelectedDataAsync(Office.CoercionType.Image,(result) => {
  //   debugger;
  //   console.log(result.value);
  // });

  await PowerPoint.run(async (context) => {
    // const slides = context.presentation.slides;
    const currentSlide = context.presentation.getSelectedSlides().getItemAt(0);
    currentSlide.load("shapes");
    await context.sync();
    const shapes = currentSlide.shapes;
    shapes.load("items");
    // shapes.load("items/textFrame/hasText");
    await context.sync();
    // for (const shape )
    //可能是Foreach之间并行了
    for (const shape of shapes.items) {
      const position = { width: shape.width, height: shape.height, left: shape.left, top: shape.top } as Position;
      console.log(position);
      if (shape.type === "Image") {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.XmlSvg, {});
        shape.id;
        keyInfo.imageInfoList.push({
          position,
          base64String: "",
        });
      }
      if (shape.type === "GeometricShape") {
        shape.load("textFrame/hasText");
        // shape.textFrame.load("hasText");
        // currentSlide.
        await context.sync();
        if (shape.textFrame.hasText) {
          shape.load("textFrame/textRange/text, textFrame/textRange/font/size, textFrame/textRange/font/color");
          await context.sync();
          keyInfo.textInfoList.push({
            position,
            textContent: shape.textFrame.textRange.text,
            fontSize: shape.textFrame.textRange.font.size,
            fontColor: shape.textFrame.textRange.font.color,
          });
        } else {
          console.log("shape");
        }
      }
      if (shape.type === "Group") {
        console.log("group");
      }
    }
    await context.sync();
  });
  console.log(keyInfo);
  return keyInfo;
};

export const extractKeyColor = async (): Promise<ChartKeyColor> => {
  let chartKeyColor = { seriesColor: [] } as ChartKeyColor;
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    // sheet.shapes.addImage
    let chart: Excel.Chart;
    try {
      chart = context.workbook.getActiveChart();
      chart.load("isNullObject");
      await context.sync();
      console.log(chart.isNullObject);
    } catch (error) {
      chart = sheet.charts.getItemAt(0);
    }
    try {
      chart.load("chartType");
      await context.sync();
      console.log("type", chart.chartType);
    } catch (error) {
      throw new Error("No chart in the sheet.");
    }
    switch (chart.chartType) {
      case "ColumnClustered":
      case "ColumnStacked":
      case "ColumnStacked100":
      case "Area":
      case "AreaStacked":
      case "AreaStacked100":
        chartKeyColor = await extractStackedColor(chart, context);
        break;
      case "LineMarkers":
      case "LineMarkersStacked":
      case "LineMarkersStacked100":
        chartKeyColor = await extractLineColor(chart, context, true);
        break;
      case "Line":
      case "LineStacked":
      case "LineStacked100":
      case "Radar":
        chartKeyColor = await extractLineColor(chart, context, false);
        break;
      case "XYScatter":
        chartKeyColor = await extractScatterColor(chart, context, false);
        break;
      case "Doughnut":
      case "Pie":
        chartKeyColor = await extractPieColor(chart, context);
        break;
      default:
        throw new Error("Not supported chart type.");
    }
  });

  return chartKeyColor;
};

const formatString = (string: String | String[]) => {
  if (typeof string === "string") return string.split(",");
  return string;
};

export const updateKeyColor = async (chartKeyColor, newChartKeyColor) => {
  chartKeyColor = formatString(chartKeyColor);
  newChartKeyColor = formatString(newChartKeyColor);

  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    // const chart = sheet.charts.getItemAt(0);
    let chart: Excel.Chart;
    try {
      chart = context.workbook.getActiveChart();
      chart.load("isNullObject");
      await context.sync();
      console.log(chart.isNullObject);
    } catch (error) {
      chart = sheet.charts.getItemAt(0);
    }
    try {
      chart.load("chartType");
      await context.sync();
      console.log("type", chart.chartType);
    } catch (error) {
      throw new Error("No chart in the sheet.");
    }
    chart.load("chartType");
    await context.sync();
    console.log("type", chart.chartType);
    switch (chart.chartType) {
      case "ColumnClustered":
      case "ColumnStacked":
      case "ColumnStacked100":
      case "Area":
      case "AreaStacked":
      case "AreaStacked100":
        updateStackedColor(chart, context, newChartKeyColor);
        break;
      case "LineMarkers":
      case "LineMarkersStacked":
      case "LineMarkersStacked100":
        updateLineColor(chart, context, newChartKeyColor, true);
        break;
      case "Line":
      case "LineStacked":
      case "LineStacked100":
      case "Radar":
        updateLineColor(chart, context, newChartKeyColor, false);
        break;
      case "XYScatter":
        updateScatterColor(chart, context, newChartKeyColor, false);
        break;
      case "Doughnut":
      case "Pie":
        updatePieColor(chart, context, newChartKeyColor);
        break;
    }
    // updateStackedColor(chart, context, newChartKeyColor);
  });

  console.log("Chart colors updated");
};
