import React, { useEffect, useRef } from 'react';
import {
  WebView as RNWebView,
  WebViewMessageEvent,
} from 'react-native-webview-tencentx5-fix';
import { renderChart, EchartConfig } from '../TemplateGenerator';
import { HtmlTemplate } from '../skeleton/ChartHtmlSkeleton';

export function AndroidChartX5Webview(props: {
  echartConfig: EchartConfig;
  androidHardwareAccelerationDisabled?: boolean;
  onLoadFinish?: () => void;
  onMessage?: (event: WebViewMessageEvent) => void;
  onExecuteJavascriptFunction?: () => string;
  debugMode?: boolean;
}) {
  const chart = useRef<RNWebView>(null);
  const {
    androidHardwareAccelerationDisabled,
    debugMode,
    echartConfig,
    onExecuteJavascriptFunction,
    onLoadFinish,
    onMessage,
  } = props;

  const onLoadEnd = () => {
    if (debugMode) {
      console.log(
        'tecent x5 browser load initialize html : ' +
          JSON.stringify(echartConfig.options)
      );
    }

    chart.current?.injectJavaScript(renderChart(echartConfig));
    //inject cutsom jave script function
    if (onExecuteJavascriptFunction !== undefined) {
      chart.current?.injectJavaScript(onExecuteJavascriptFunction());
    }
    onLoadFinish?.();
    loadFinishTag.current = true;
  };

  const loadFinishTag = useRef<boolean>(false);

  useEffect(() => {
    if (loadFinishTag.current) {
      if (debugMode) {
        console.log(
          'tecent x5 browser dispatch newest html after load finish : ' +
            JSON.stringify(echartConfig.options)
        );
      }
      //fuck the reload and the damned blank screen , get work-around by manipulate DOM in html + use loading for first launch
      // chart.current?.reload();
      chart.current?.postMessage(JSON.stringify(echartConfig.options));
      //inject cutsom jave script function
      if (onExecuteJavascriptFunction !== undefined) {
        chart.current?.injectJavaScript(onExecuteJavascriptFunction());
      }
    }
  }, [echartConfig]);

  return (
    <RNWebView
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        opacity: 0.99,
        backgroundColor: 'transparent',
      }}
      androidHardwareAccelerationDisabled={
        androidHardwareAccelerationDisabled === true
      }
      scrollEnabled={false}
      onMessage={onMessage}
      scalesPageToFit
      javaScriptEnabled
      ref={chart}
      source={{ html: HtmlTemplate }}
      onLoadEnd={onLoadEnd}
      originWhitelist={['*']}
      {...props}
    />
  );
}
