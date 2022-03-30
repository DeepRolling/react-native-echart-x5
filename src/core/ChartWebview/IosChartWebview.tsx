import React, { useEffect, useRef } from 'react';
import { WebView as RNWebView } from 'react-native-webview';
import { renderChart, EchartConfig } from '../TemplateGenerator';
import type { WebViewMessageEvent } from 'react-native-webview-tencentx5-fix';
import { HtmlTemplate } from '../skeleton/ChartHtmlSkeleton';

export function IosChartWebview(props: {
  echartConfig: EchartConfig;
  onLoadFinish?: () => void;
  onMessage?: (event: WebViewMessageEvent) => void;
  onExecuteJavascriptFunction?: () => string;
  debugMode?: boolean;
}) {
  const chart = useRef<RNWebView>(null);
  const {
    debugMode,
    echartConfig,
    onExecuteJavascriptFunction,
    onLoadFinish,
    onMessage,
  } = props;

  const onLoadEnd = () => {
    if (debugMode) {
      console.log(
        'react-native native browser load initialize html : ' + echartConfig
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
          'react-native native browser dispatch newest html after load finish : ' +
            echartConfig
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
