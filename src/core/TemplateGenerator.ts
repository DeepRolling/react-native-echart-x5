// @ts-ignore
import worldJson from './../map/worldJson';
import type { EChartOption } from 'echarts';

function toString(obj: any) {
  let result = JSON.stringify(obj, function (_key: string, val) {
    if (typeof val === 'function') {
      return `~--demo--~${val}~--demo--~`;
    }
    return val;
  });

  do {
    result = result
      .replace('"~--demo--~', '')
      .replace('~--demo--~"', '')
      .replace(/\\n/g, '')
      .replace(/\\\"/g, '"'); //最后一个replace将release模式中莫名生成的\"转换成"
  } while (result.indexOf('~--demo--~') >= 0);
  return result;
}

export interface EchartConfig<TSeries = EChartOption.Series> {
  /**
   * width of echart(unit is px)
   */
  width: number | string;
  /**
   * height of echart(unit is px)
   */
  height: number | string;
  /**
   * options , used to render chart
   */
  options: EChartOption<TSeries>;
  /**
   * used to command echart replace and re-render specified field in options when update
   */
  optionReplaceMerge?: string | string[];
  /**
   * echart theme name
   */
  themeName?: string;
  /**
   * echart background color
   */
  backgroundColor?: string;
  /**
   * if this prop is true , the chart will use map
   */
  useMap?: boolean;
  /**
   * if this prop is true , the chart will use svg render
   */
  useSvgRender?: boolean;
}

export enum WebViewMessageTYpe {
  DATA_ZOOM,
  LOG,
  CLICK,
}

export type CustomWebViewMessage = {
  type: WebViewMessageTYpe;
  value: string;
};

export function renderChart(props: EchartConfig) {
  return `
    function generatedWebViewMessage(type: WebViewMessageTYpe, value: string) {
      const messageObj = {
        type,
        value,
      };
      return JSON.stringify(messageObj);
    }
    // Debug define the console message
    console = new Object();
    console.log = function(log) {
      window.ReactNativeWebView.postMessage(generatedWebViewMessage(${
        WebViewMessageTYpe.LOG
      }, log));
    };
    console.debug = console.log;
    console.info = console.log;
    console.warn = console.log;
    console.error = console.log;
    //print current echart version
    console.log('current echart version is : '+echarts.version);
    const eChartsContainer = document.getElementById('main')
    eChartsContainer.style.height = "${props.height}px";
    eChartsContainer.style.width = "${props.width}px";
    eChartsContainer.style.background = "${props.backgroundColor}";
    ${
      props.useMap === true
        ? `echarts.registerMap('world', ${JSON.stringify(worldJson)});`
        : ''
    }
    const myChart = echarts.init(eChartsContainer, '${
      props.themeName === undefined ? null : props.themeName
    }',{
       ${props.useSvgRender !== true ? "renderer:'canvas'," : "renderer:'svg',"}
    });
    let clickName = {}
    myChart.on('mousedown', (params)=>{
      clickName = {
        name: params.name || '',
        value: params.value || 0
      }
    });
    myChart.on('dataZoom', (params)=>{
        window.ReactNativeWebView.postMessage(generatedWebViewMessage(${
          WebViewMessageTYpe.DATA_ZOOM
        }, params.type))
    });
    myChart.getZr().on('click', (params)=>{
      clickName = {}
    });
    // 借助dom click获取点击目标
    eChartsContainer.onclick = ()=>{
      if(clickName.name || clickName.value){
        window.ReactNativeWebView.postMessage(generatedWebViewMessage(${
          WebViewMessageTYpe.CLICK
        }, JSON.stringify(clickName)))
      }
    };
    var postEvent = params => {
      var seen = [];
      var paramsString = JSON.stringify(params, function(key, val) {
        if (val != null && typeof val == "object") {
          if (seen.indexOf(val) >= 0) {
            return;
          }
          seen.push(val);
        }
        return val;
      });
    }
    myChart.setOption(${toString(props.options)});

   //判断是否是iOS
    let u = navigator.userAgent;
    let isiOS = !!u.match(/\\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if(isiOS){
       window.addEventListener("message", function(event) {
          if(!event.isTrusted){// 非图表类点击则执行刷新数据操作
            var option = JSON.parse(event.data);
            myChart.setOption(option,${
              props.optionReplaceMerge === undefined
                ? undefined
                : JSON.stringify({
                    replaceMerge: props.optionReplaceMerge,
                  })
            });
          }
        });
    } else {
      // android监听
      window.document.addEventListener('message', function(event) {
        var option = JSON.parse(event.data);
        myChart.setOption(option,${
          props.optionReplaceMerge === undefined
            ? undefined
            : JSON.stringify({
                replaceMerge: props.optionReplaceMerge,
              })
        });
      });
    }
    myChart.on('mapselectchanged', postEvent);
  `;
}
