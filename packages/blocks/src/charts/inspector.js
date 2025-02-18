/**
 * WordPress dependencies
 */
import { InspectorControls, MediaUpload } from "@wordpress/block-editor";
import {
  ToggleControl,
  TextControl,
  RangeControl,
  SelectControl,
  Button,
  TextareaControl,
  CardDivider,
  Spinner,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import Papa from "papaparse";
import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { store as noticesStore } from "@wordpress/notices";
import axios from "axios";

/**
 * Internal depencencies
 */
import {
  SimpleRangeControl,
  ColorControl,
  HeaderTabs,
  IconicBtnGroup,
  AdvancedOptions,
  ZoloPanelBody,
  NormalBGControl,
  BoxShadowControl,
  BorderControl,
  ResDimensionsControl,
} from "@zoloblocks/library";

import objAttributes from "./attributes";

import {
  CHART_TYPES,
  SOURCE_TYPES,
  POSITIONS,
  THEME_TYPES,
  CHART_HEIGHT,
} from "./constants";

import {
  CHART_BG_COLOR,
  CHART_BORDER,
  CHART_BORDER_RADIUS,
  CHART_MARGIN,
  CHART_PADDING,
  CHART_BOX_SHADOW,
} from "./constants";

import { DEFAULT_ALIGNS } from "../../../library/src/global/constants";

import ExtraImage from "../../../library/src/images/singleblocks.png";

function Inspector(props) {
  const { attributes, setAttributes } = props;
  const {
    resMode,
    chartType,
    gssUrl,
    chartHeight,
    sourceType,
    uploadStatus,
    chartInputData,
    // additional options
    showTitle,
    showSubTitle,
    showLegend,
    showTooltip,
    showGrid,
    showGridY,
    showGridX,
    titleObject,
    subTitleObject,
    legendObject,
    tooltipObject,
    chartBackground,
    pieChartLength,
    barChartLength,
    pieChartLabels,
    xAxisColor,
    yAxisColor,
    showToolbar,
    showDownload,
    showSelection,
    showZoom,
    showZoomIn,
    showZoomOut,
    showPanel,
    showReset,
    showDropshadow,
    fileUrl,
    barChartData,
    pieChartData,
    zolo_pro_status,
  } = attributes;

  const requiredProps = {
    attributes,
    setAttributes,
    resMode,
    objAttributes,
  };

  /**
   * On Select File
   */
  const onSelectFile = (file) => {
    const csvFile = file.url;

    Papa.parse(csvFile, {
      header: true,
      download: true,
      complete: (result) => {
        const { data } = result;
        const headers = Object.keys(data[0]);

        const labels = data.map((row) => row[headers[0]]);

        const series = headers.slice(1).map((header) => ({
          name: header,
          data: data.map((row) => row[header]),
        }));

        const pieSeries = headers
          .slice(1)
          .flatMap((header) => data.map((row) => Number(row[header])))
          .filter((value) => !isNaN(value));

        setAttributes({
          barChartData: {
            options: { labels },
            series,
          },
          pieChartData: {
            series: pieSeries,
            labels,
          },
          pieChartLength: pieSeries.length,
          barChartLength: series.length,
          pieChartLabels: labels,
          fileUrl: csvFile,
          uploadStatus: !uploadStatus,
        });
      },
    });
  };

  // handle CSV Input from TextareaControl Component and pass on result to DataPareser
  const handleInputData = (e) => {
    parseCSVData(e);
  };

  /**
   * Parse CSV Data
   */
  function parseCSVData(csvData) {
    const rows = csvData.trim().split("\n");
    const headers = rows[0].split(",");
    const parsedData = [];

    for (let i = 1; i < rows.length; i++) {
      const rowData = rows[i].split(",");
      const obj = {};

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = rowData[j];
      }

      parsedData.push(obj);
    }
    const labels = parsedData.map((data) => data[headers[0]]);
    const series = headers.slice(1).map((header) => ({
      name: header,
      data: parsedData.map((data) => data[header]),
    }));

    const pieSeries = parsedData
      .map((data, index) => data[headers[1]])
      .map((i) => Number(i));

    setAttributes({
      barChartData: {
        options: {
          labels: labels,
        },
        series: series,
      },
      pieChartData: {
        options: {
          labels: labels,
        },
        series: pieSeries,
        labels: labels,
      },
      pieChartLength: pieSeries.length,
      barChartLength: series.length,
      pieChartLabels: labels,
    });
  }

  // extract Ids
  function extractIdsFromUrl(url) {
    const regex = /\/d\/(.*?)\/edit.*?gid=(\d+)/;
    const match = url.match(regex);

    if (match) {
      const spreadsheetId = match[1];
      const sheetId = match[2];
      return { spreadsheetId, sheetId };
    } else {
      return {};
    }
  }

  // Fetch Google Sheet Data
  const { createErrorNotice } = useDispatch(noticesStore);
  const [loading, setLoading] = useState(false);
  /**
   * Fetch Google Sheet Data
   */
  const fetchGoogleSheetData = () => {
    if (!gssUrl) {
      createErrorNotice(
        __("😔 Please provide a Google Spreadsheet URL.", "zoloblocks")
      );
      return;
    }

    // Start loading
    setLoading(true);

    const { spreadsheetId, sheetId } = extractIdsFromUrl(gssUrl);

    if (!spreadsheetId || !sheetId) {
      createErrorNotice(__("😔 Invalid Google Spreadsheet URL.", "zoloblocks"));
      setLoading(false);
      return;
    }

    // Google Spreadsheet URL
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${sheetId}`;

    // Use axios to fetch the data from the Google Spreadsheet
    axios
      .get(url)
      .then((response) => {
        const data = response.data;

        // check if the data is empty
        if (!data) {
          createErrorNotice(__("😔 Sorry, No data found", "zoloblocks"));
          setLoading(false);
          return;
        }

        // parse the data
        parseCSVData(data);
        // Stop loading
        setLoading(false);
      })
      .catch((error) => {
        createErrorNotice(error.message);
        setLoading(false);
      });
  };

  return (
    <InspectorControls key="controls">
      <HeaderTabs
        block="zolo/charts"
        attributes={attributes}
        setAttributes={setAttributes}
        generalTab={
          <>
            <ZoloPanelBody
              title={__("General", "zoloblocks")}
              firstOpen={true}
              panelProps={props}
            >
              <SelectControl
                label={__("Source Type", "zoloblocks")}
                value={sourceType}
                options={applyFilters("zolo.charts.sourceTypes", SOURCE_TYPES)}
                onChange={(v) => setAttributes({ sourceType: v })}
              />
              {sourceType === "upload" && (
                <MediaUpload
                  onSelect={onSelectFile}
                  type="file"
                  value={fileUrl}
                  render={({ open }) => (
                    <Button
                      style={{ marginBottom: "10px" }}
                      className="zolo-action-button"
                      variant="primary"
                      onClick={open}
                    >
                      {fileUrl
                        ? __("Change CSV File", "zoloblocks-pro")
                        : __("Select CSV File", "zoloblocks-pro")}
                    </Button>
                  )}
                  allowedTypes={["text/csv"]}
                />
              )}
              {sourceType == "input" && (
                <div className="zolo-flex-col-control">
                  <TextareaControl
                    label={__(
                      "Enter chart data separated by commas",
                      "zoloblocks"
                    )}
                    placeholder={__(
                      `Label, Value
                                            Team A, 10
                                            Team B, 15
                                            Team C, 20,
                                            Team D, 5`,
                      "zoloblocks"
                    )}
                    value={chartInputData}
                    rows={10}
                    onChange={(value) => {
                      setAttributes({ chartInputData: value });
                      handleInputData(value);
                    }}
                  />
                </div>
              )}

              {zolo_pro_status === "active" &&
                sourceType === "google-spreadsheet" && (
                  <>
                    <CardDivider />
                    <p className="zolo-custom-help-note">
                      {__(
                        "Make sure your Google Spreadsheet is public.",
                        "zoloblocks"
                      )}
                    </p>
                    <TextControl
                      label={__("Google Spreadsheet URL", "zoloblocks")}
                      value={gssUrl}
                      onChange={(v) =>
                        setAttributes({
                          gssUrl: v,
                        })
                      }
                    />
                    <Button
                      style={{ marginBottom: "10px" }}
                      className="zolo-action-button"
                      variant="primary"
                      onClick={fetchGoogleSheetData}
                    >
                      {__("Fetch Data", "zoloblocks")}
                      {
                        // loading
                        loading && <Spinner />
                      }
                    </Button>
                    <CardDivider />
                  </>
                )}

              <CardDivider />

              <SelectControl
                label={__("Chart Type", "zoloblocks")}
                value={chartType}
                options={CHART_TYPES}
                onChange={(v) => {
                  setAttributes({ chartType: v });
                }}
                help={
                  chartType === "line"
                    ? __(
                        "You may need to save and refresh the page to see the changes.",
                        "zoloblocks"
                      )
                    : ""
                }
              />

              <div className="zolo-flex-col-control">
                <SimpleRangeControl
                  label={__("Height", "zoloblocks")}
                  value={chartHeight}
                  onChange={(height) =>
                    setAttributes({
                      chartHeight: height,
                    })
                  }
                  onReset={() =>
                    setAttributes({
                      chartHeight: undefined,
                    })
                  }
                  min={200}
                  max={1000}
                />
              </div>
            </ZoloPanelBody>
            <ZoloPanelBody
              title={__("Additional Options", "zoloblocks")}
              firstOpen={false}
              panelProps={props}
            >
              <div
                className="zolo-custom-heading"
                style={{ border: 0, paddingTop: 0 }}
              >
                {__("show/hide elements", "zoloblocks")}
              </div>
              <ToggleControl
                label={__("Title", "zoloblocks")}
                checked={showTitle}
                onChange={() =>
                  setAttributes({
                    showTitle: !showTitle,
                  })
                }
              />
              <ToggleControl
                label={__("sub Title", "zoloblocks")}
                checked={showSubTitle}
                onChange={() =>
                  setAttributes({
                    showSubTitle: !showSubTitle,
                  })
                }
              />
              <ToggleControl
                label={__("Legend", "zoloblocks")}
                checked={showLegend}
                onChange={() =>
                  setAttributes({
                    showLegend: !showLegend,
                  })
                }
              />
              <ToggleControl
                label={__("Tooltip", "zoloblocks")}
                checked={showTooltip}
                onChange={() =>
                  setAttributes({
                    showTooltip: !showTooltip,
                  })
                }
              />
              <ToggleControl
                label={__("Grid", "zoloblocks")}
                checked={showGrid}
                onChange={() =>
                  setAttributes({
                    showGrid: !showGrid,
                  })
                }
              />
              <ToggleControl
                label={__("Toolbar", "zoloblocks")}
                checked={showToolbar}
                onChange={() =>
                  setAttributes({
                    showToolbar: !showToolbar,
                  })
                }
              />
              {showToolbar && (
                <>
                  <ToggleControl
                    label={__("Download", "zoloblocks")}
                    checked={showDownload}
                    onChange={() =>
                      setAttributes({
                        showDownload: !showDownload,
                      })
                    }
                  />
                  <ToggleControl
                    label={__("Zoom", "zoloblocks")}
                    checked={showZoom}
                    onChange={() =>
                      setAttributes({
                        showZoom: !showZoom,
                      })
                    }
                  />
                  <ToggleControl
                    label={__("Zoom In", "zoloblocks")}
                    checked={showZoomIn}
                    onChange={() =>
                      setAttributes({
                        showZoomIn: !showZoomIn,
                      })
                    }
                  />
                  <ToggleControl
                    label={__("Zoom Out", "zoloblocks")}
                    checked={showZoomOut}
                    onChange={() =>
                      setAttributes({
                        showZoomOut: !showZoomOut,
                      })
                    }
                  />
                  <ToggleControl
                    label={__("Pan", "zoloblocks")}
                    checked={showPanel}
                    onChange={() =>
                      setAttributes({
                        showPanel: !showPanel,
                      })
                    }
                  />
                  <ToggleControl
                    label={__("Reset", "zoloblocks")}
                    checked={showReset}
                    onChange={() =>
                      setAttributes({
                        showReset: !showReset,
                      })
                    }
                  />
                </>
              )}
            </ZoloPanelBody>
            {showTitle && (
              <ZoloPanelBody
                title={__("Title", "zoloblocks")}
                firstOpen={false}
                panelProps={props}
              >
                <TextControl
                  label={__("Text", "zoloblocks")}
                  onChange={(newText) =>
                    setAttributes({
                      titleObject: {
                        ...titleObject,
                        text: newText,
                      },
                    })
                  }
                  value={titleObject.text}
                />
                <CardDivider />
                <div className="zolo-flex-row-control-tab">
                  <IconicBtnGroup
                    label={__("Alignment", "zoloblocks")}
                    value={titleObject.align}
                    onChange={(v) =>
                      setAttributes({
                        titleObject: {
                          ...titleObject,
                          align: v,
                        },
                      })
                    }
                    options={DEFAULT_ALIGNS}
                  />
                </div>
              </ZoloPanelBody>
            )}
            {showSubTitle && (
              <ZoloPanelBody
                title={__("Sub Title", "zoloblocks")}
                firstOpen={false}
                panelProps={props}
              >
                <TextControl
                  label={__("Text", "zoloblocks")}
                  onChange={(newText) =>
                    setAttributes({
                      subTitleObject: {
                        ...subTitleObject,
                        text: newText,
                      },
                    })
                  }
                  value={subTitleObject.text}
                />
                <CardDivider />
                <div className="zolo-flex-row-control-tab">
                  <IconicBtnGroup
                    label={__("Alignment", "zoloblocks")}
                    value={subTitleObject.align}
                    onChange={(v) =>
                      setAttributes({
                        subTitleObject: {
                          ...subTitleObject,
                          align: v,
                        },
                      })
                    }
                    options={DEFAULT_ALIGNS}
                  />
                </div>
              </ZoloPanelBody>
            )}
            {showLegend && (
              <ZoloPanelBody
                title={__("Legend", "zoloblocks")}
                firstOpen={false}
                panelProps={props}
              >
                <IconicBtnGroup
                  label={__("Position", "zoloblocks")}
                  value={legendObject.position}
                  onChange={(v) =>
                    setAttributes({
                      legendObject: {
                        ...legendObject,
                        position: v,
                      },
                    })
                  }
                  options={POSITIONS}
                />
                <div className="zolo-flex-row-control-tab">
                  <IconicBtnGroup
                    label={__("Horizontal", "zoloblocks")}
                    value={legendObject.horizontalAlign}
                    onChange={(v) =>
                      setAttributes({
                        legendObject: {
                          ...legendObject,
                          horizontalAlign: v,
                        },
                      })
                    }
                    options={DEFAULT_ALIGNS}
                  />
                </div>
                <CardDivider />
                <ToggleControl
                  label={__("Floating", "zoloblocks")}
                  checked={legendObject.floating}
                  onChange={() =>
                    setAttributes({
                      legendObject: {
                        ...legendObject,
                        floating: !legendObject.floating,
                      },
                    })
                  }
                />
                <div className="zolo-flex-col-control">
                  <RangeControl
                    label={__("Offset X", "zoloblocks")}
                    value={legendObject.offsetX}
                    onChange={(v) =>
                      setAttributes({
                        legendObject: {
                          ...legendObject,
                          offsetX: v,
                        },
                      })
                    }
                    min={-100}
                    max={100}
                  />
                </div>

                <div className="zolo-flex-col-control">
                  <RangeControl
                    label={__("Offset Y", "zoloblocks")}
                    value={legendObject.offsetY}
                    onChange={(v) =>
                      setAttributes({
                        legendObject: {
                          ...legendObject,
                          offsetY: v,
                        },
                      })
                    }
                    min={-100}
                    max={100}
                  />
                </div>
              </ZoloPanelBody>
            )}
            {showTooltip && (
              <ZoloPanelBody
                title={__("Tooltip", "zoloblocks")}
                firstOpen={false}
                panelProps={props}
              >
                <div
                  className="zolo-custom-heading"
                  style={{ border: 0, paddingTop: 0 }}
                >
                  {__("show/hide elements", "zoloblocks")}
                </div>
                <ToggleControl
                  label={__("Enabled", "zoloblocks")}
                  checked={tooltipObject.enabled}
                  onChange={() =>
                    setAttributes({
                      tooltipObject: {
                        ...tooltipObject,
                        enabled: !tooltipObject.enabled,
                      },
                    })
                  }
                />
                <ToggleControl
                  label={__("Follow Cursor", "zoloblocks")}
                  checked={tooltipObject.followCursor}
                  onChange={() =>
                    setAttributes({
                      tooltipObject: {
                        ...tooltipObject,
                        followCursor: !tooltipObject.followCursor,
                      },
                    })
                  }
                />
                <ToggleControl
                  label={__("Inverse Order", "zoloblocks")}
                  checked={tooltipObject.inverseOrder}
                  onChange={() =>
                    setAttributes({
                      tooltipObject: {
                        ...tooltipObject,
                        inverseOrder: !tooltipObject.inverseOrder,
                      },
                    })
                  }
                />
                <ToggleControl
                  label={__("Hide Empty Series", "zoloblocks")}
                  checked={tooltipObject.hideEmptySeries}
                  onChange={() =>
                    setAttributes({
                      tooltipObject: {
                        ...tooltipObject,
                        hideEmptySeries: !tooltipObject.hideEmptySeries,
                      },
                    })
                  }
                />

                <ToggleControl
                  label={__("Fill Series Color", "zoloblocks")}
                  checked={tooltipObject.fillSeriesColor}
                  onChange={() =>
                    setAttributes({
                      tooltipObject: {
                        ...tooltipObject,
                        fillSeriesColor: !tooltipObject.fillSeriesColor,
                      },
                    })
                  }
                />
                <CardDivider />
                <div className="zolo-flex-row-control-tab">
                  <IconicBtnGroup
                    label={__("Theme", "zoloblocks")}
                    value={tooltipObject.theme}
                    onChange={(v) =>
                      setAttributes({
                        tooltipObject: {
                          ...tooltipObject,
                          theme: v,
                        },
                      })
                    }
                    options={THEME_TYPES}
                  />
                </div>
              </ZoloPanelBody>
            )}
            {showGrid && (
              <ZoloPanelBody
                title={__("Grid", "zoloblocks")}
                firstOpen={false}
                panelProps={props}
              >
                <div
                  className="zolo-custom-heading"
                  style={{ border: 0, paddingTop: 0 }}
                >
                  {__("show/hide elements", "zoloblocks")}
                </div>
                <ToggleControl
                  label={__("Grid X", "zoloblocks")}
                  checked={showGridX}
                  onChange={() =>
                    setAttributes({
                      showGridX: !showGridX,
                    })
                  }
                />
                <ToggleControl
                  label={__("Grid Y", "zoloblocks")}
                  checked={showGridY}
                  onChange={() =>
                    setAttributes({
                      showGridY: !showGridY,
                    })
                  }
                />
              </ZoloPanelBody>
            )}
          </>
        }
        styleTab={
          <>
            <ZoloPanelBody
              title={__("Charts", "zoloblocks")}
              firstOpen={true}
              stylePanel={true}
              panelProps={props}
            >
              <NormalBGControl
                requiredProps={requiredProps}
                controlName={CHART_BG_COLOR}
                noMainBGImg={false}
              />
              <ResDimensionsControl
                label={__("Padding", "zoloblocks")}
                controlName={CHART_PADDING}
                requiredProps={requiredProps}
                forBorderRadius={false}
              />
              <ResDimensionsControl
                label={__("Margin", "zoloblocks")}
                controlName={CHART_MARGIN}
                requiredProps={requiredProps}
                forBorderRadius={false}
              />
              <CardDivider />
              <BorderControl
                label={__("Border", "zoloblocks")}
                controlName={CHART_BORDER}
                requiredProps={requiredProps}
              />
              <BoxShadowControl
                controlName={CHART_BOX_SHADOW}
                requiredProps={requiredProps}
              />
              <ResDimensionsControl
                label={__("Border Radius", "zoloblocks")}
                controlName={CHART_BORDER_RADIUS}
                requiredProps={requiredProps}
                forBorderRadius={true}
              />
            </ZoloPanelBody>
            <ZoloPanelBody
              title={__("Colors", "zoloblocks")}
              firstOpen={false}
              stylePanel={true}
              panelProps={props}
            >
              <ColorControl
                label={__("xAxis Color", "zoloblocks")}
                color={xAxisColor}
                onChange={(color) => setAttributes({ xAxisColor: color })}
              />
              <ColorControl
                label={__("yAxis Color", "zoloblocks")}
                color={yAxisColor}
                onChange={(color) => setAttributes({ yAxisColor: color })}
              />
              <CardDivider />
              {chartType === "pie" || chartType === "donut"
                ? Array.from(
                    { length: pieChartLength },
                    (_, index) => index
                  ).map((i) => (
                    <ColorControl
                      label={__(`${chartType} color ${i + 1}`, "zoloblocks")}
                      color={attributes.pieChartColor[i]}
                      onChange={(color) => {
                        const pieChartColor = [...attributes.pieChartColor];
                        pieChartColor[i] = color;
                        setAttributes({ pieChartColor });
                      }}
                    />
                  ))
                : // Else condition
                  Array.from(
                    { length: barChartLength },
                    (_, index) => index
                  ).map((i) => (
                    <ColorControl
                      label={__(`${chartType} color ${i + 1}`, "zoloblocks")}
                      color={attributes.pieChartColor[i]}
                      onChange={(color) => {
                        const pieChartColor = [...attributes.pieChartColor];
                        pieChartColor[i] = color;
                        setAttributes({ pieChartColor });
                      }}
                    />
                  ))}
            </ZoloPanelBody>
            {showTitle && (
              <>
                <ZoloPanelBody
                  title={__("Title", "zoloblocks")}
                  firstOpen={false}
                  panelProps={props}
                >
                  <ColorControl
                    label={__("Color", "zoloblocks")}
                    color={titleObject.style.color}
                    onChange={(color) =>
                      setAttributes({
                        titleObject: {
                          ...titleObject,
                          style: {
                            ...titleObject.style,
                            color: color,
                          },
                        },
                      })
                    }
                  />
                  <div className="zolo-flex-col-control">
                    <SimpleRangeControl
                      label={__("Font Size", "zoloblocks")}
                      value={titleObject.style.fontSize}
                      onChange={(fontSize) =>
                        setAttributes({
                          titleObject: {
                            ...titleObject,
                            style: {
                              ...titleObject.style,
                              fontSize: fontSize,
                            },
                          },
                        })
                      }
                      min={0}
                      max={100}
                      onReset={() =>
                        setAttributes({
                          titleObject: {
                            ...titleObject,
                            style: {
                              ...titleObject.style,
                              fontSize: undefined,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </ZoloPanelBody>
              </>
            )}
            {showSubTitle && (
              <>
                <ZoloPanelBody
                  title={__("Sub Title", "zoloblocks")}
                  firstOpen={false}
                  panelProps={props}
                >
                  <ColorControl
                    label={__("Color", "zoloblocks")}
                    color={subTitleObject.style.color}
                    onChange={(color) =>
                      setAttributes({
                        subTitleObject: {
                          ...subTitleObject,
                          style: {
                            ...subTitleObject.style,
                            color: color,
                          },
                        },
                      })
                    }
                  />
                  <div className="zolo-flex-col-control">
                    <SimpleRangeControl
                      label={__("Font Size", "zoloblocks")}
                      value={subTitleObject.style.fontSize}
                      onChange={(fontSize) =>
                        setAttributes({
                          subTitleObject: {
                            ...subTitleObject,
                            style: {
                              ...subTitleObject.style,
                              fontSize: fontSize,
                            },
                          },
                        })
                      }
                      min={0}
                      max={100}
                      onReset={() =>
                        setAttributes({
                          subTitleObject: {
                            ...subTitleObject,
                            style: {
                              ...subTitleObject.style,
                              fontSize: undefined,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </ZoloPanelBody>
              </>
            )}
            {showLegend && (
              <>
                <ZoloPanelBody
                  title={__("Legend Color", "zoloblocks")}
                  firstOpen={false}
                  panelProps={props}
                >
                  <ToggleControl
                    label={__("useSeriesColors", "zoloblocks")}
                    checked={legendObject.labels.useSeriesColors}
                    onChange={() =>
                      setAttributes({
                        legendObject: {
                          ...legendObject,
                          labels: {
                            useSeriesColors:
                              !legendObject.labels.useSeriesColors,
                          },
                        },
                      })
                    }
                  />
                  {
                    // If condition
                    !legendObject.labels.useSeriesColors && (
                      <ColorControl
                        label={__("Legend Color", "zoloblocks")}
                        color={legendObject.labels.colors}
                        onChange={(color) =>
                          setAttributes({
                            legendObject: {
                              ...legendObject,
                              labels: {
                                ...legendObject.labels,
                                colors: color,
                              },
                            },
                          })
                        }
                      />
                    )
                  }
                </ZoloPanelBody>
              </>
            )}
          </>
        }
        advancedTab={
          <>
            <div className="zolo-side-premium-notice-wrap">
              <img
                src={ExtraImage}
                alt="extra settings"
                width="300"
                height="700"
              />
              <div className="zolo-side-premium-notice">
                <svg
                  className="zolo-premium-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  id="Layer_1"
                  viewBox="0 0 100 100"
                >
                  <path
                    d="M50.17,19.22c1.91-3.48,5.22-4.43,5.22-4.43l-5.21-5.29-5.21,5.29s3.31.95,5.21,4.43Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <path
                    d="M77.56,31.04c1.42-.03,3.35-1.18,3.35-3.38s-1.98-3.27-3.46-3.43-2.49,1.5-2.49,1.5c0,0,1.93-.29,2.06,1.63.13,1.93-2.63,1.85-2.46,2.33.16.48,1.58,1.37,3,1.34Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <path
                    d="M72.73,18.05c.91,0,1.65-.74,1.65-1.65s-.74-1.65-1.65-1.65-1.65.74-1.65,1.65.74,1.65,1.65,1.65Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <path
                    d="M92.97,19.53c-1.12,0-2.03.91-2.03,2.03s.91,2.03,2.03,2.03,2.03-.91,2.03-2.03-.91-2.03-2.03-2.03Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <circle
                    cx="50.03"
                    cy="6.82"
                    r="2.22"
                    style={{ fill: "#d59f30" }}
                  />
                  <path
                    d="M22.79,31.04c1.42.03,2.84-.86,3-1.34.16-.48-2.6-.4-2.46-2.33s2.06-1.63,2.06-1.63c0,0-1.02-1.66-2.49-1.5s-3.46,1.23-3.46,3.43,1.93,3.35,3.35,3.38Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <path
                    d="M27.61,18.05c.91,0,1.65-.74,1.65-1.65s-.74-1.65-1.65-1.65-1.65.74-1.65,1.65.74,1.65,1.65,1.65Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <path
                    d="M7.04,19.14c-1.12,0-2.04.91-2.04,2.04s.91,2.04,2.04,2.04,2.04-.91,2.04-2.04-.91-2.04-2.04-2.04Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <path
                    d="M81.35,24.63s1,1.04,1.13,2.65c.12,1.61-1.16,6.19-5.71,5.75-4.54-.44-6.35-4.98-6.27-7.15.08-2.17,1-3.7,1.77-3.94,1.45-.56,1.69-.68,1.65-1.73-.2-1.28-2.17-.56-2.81-.56-1.37-1.77-2.21-1.25-2.65-.32-.44.92,1.05,2.13,1.49,2.77-.48,2.85-6.27,7.07-10.37,7.19-4.1.12-6.51-2.93-6.97-5.55-.46-2.61,1.23-3.78,2.47-4.02,1.25-.24,2.61.52,2.93,1.45.32.92-.44,1.41-1.13,2.29,3.3.56,3.94-.96,4.26-2.09.32-1.12-.76-3.98-4.34-4.5-2.88-.42-5.65,2.61-6.62,3.82-.98-1.21-3.75-4.24-6.62-3.82-3.58.52-4.66,3.38-4.34,4.5.32,1.13.96,2.65,4.26,2.09-.68-.88-1.45-1.36-1.13-2.29.32-.92,1.69-1.69,2.93-1.45,1.25.24,2.93,1.41,2.47,4.02-.46,2.61-2.87,5.67-6.97,5.55-4.1-.12-9.89-4.34-10.37-7.19.44-.64,1.93-1.85,1.49-2.77-.44-.92-1.29-1.45-2.65.32-.64,0-2.61-.72-2.81.56-.04,1.05.2,1.17,1.65,1.73.76.24,1.69,1.77,1.77,3.94.08,2.17-1.73,6.71-6.27,7.15-4.54.44-5.83-4.14-5.71-5.75.12-1.61,1.13-2.65,1.13-2.65,0,0-5.26-2.66-9.92.32,1.12,1.32,5.55,2.25,10.31,14.02,8.08-5.09,19.29-8.24,31.67-8.24,11.68,0,22.3,2.8,30.25,7.39,4.63-10.96,8.87-11.87,9.96-13.16-4.66-2.98-9.93-.32-9.93-.32Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <path
                    d="M71.72,54.99l-9.06,9.06c1.34,1.5,2.93,3.91,2.93,6.06,0,2.59-1.03,4.74-2.69,6.45-1.61,1.66-3.71,2.48-6.18,2.48h-19.67l34.55-33.99s.01,0,.02,0l5.62-5.55c-7.03-3.77-16.18-6.04-26.18-6.04s-18.92,2.22-25.92,5.91v23.64s21.69-22.03,21.69-22.03c1.39-.1,2.8-.16,4.24-.16,2.06,0,4.07.12,6.02.33l-31.95,31.81v21.52l12.76-.09h18.8c6.62,0,12.11-2.04,16.69-6.13,4.47-4.09,6.73-10.76,6.73-17.1,0-6.71-3.38-12.35-8.39-16.16ZM28.95,42.39c-.66,0-1.2-.54-1.2-1.2s.54-1.2,1.2-1.2,1.2.54,1.2,1.2-.54,1.2-1.2,1.2ZM35.1,40.45c-.66,0-1.2-.54-1.2-1.2s.54-1.2,1.2-1.2,1.2.54,1.2,1.2-.54,1.2-1.2,1.2ZM41.96,38.97c-.66,0-1.2-.54-1.2-1.2s.54-1.2,1.2-1.2,1.2.54,1.2,1.2-.54,1.2-1.2,1.2ZM49.59,38.26c-.66,0-1.2-.54-1.2-1.2s.54-1.2,1.2-1.2,1.2.54,1.2,1.2-.54,1.2-1.2,1.2ZM70.23,39.11c.66,0,1.2.54,1.2,1.2s-.54,1.2-1.2,1.2-1.2-.54-1.2-1.2.54-1.2,1.2-1.2ZM64.09,37.33c.66,0,1.2.54,1.2,1.2s-.54,1.2-1.2,1.2-1.2-.54-1.2-1.2.54-1.2,1.2-1.2ZM56.02,37.37c0-.66.54-1.2,1.2-1.2s1.2.54,1.2,1.2-.54,1.2-1.2,1.2-1.2-.54-1.2-1.2Z"
                    style={{ fill: "#d59f30" }}
                  />
                  <rect width={100} height={100} style={{ fill: "none" }} />
                </svg>

                <p>Get Zoloblocks for advanced control and extra features.</p>
                <a
                  href="https://wordpress.org/plugins/zoloblocks/"
                  target="_blank"
                >
                  Go Zoloblocks
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
          </>
        }
      />
    </InspectorControls>
  );
}
export default Inspector;
