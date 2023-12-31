// 封装DNS查询函数
function dnsQuery(url, callback) {
  let options = { url: url, timeout: 1 };
  $httpClient.get(options, function(error, response, data) {
      if (!data || error) {
          callback();
      } else { 
          let res = data.replace(/[\[\]"]/g, '').replace(/,/g, ';');
          // 判断 res 是否为 "0"、空字符串或字符串 "0"
          if (typeof res !== 'string' || res === "0" || res === "" || res === 0) {
              callback();
          } else {
              callback({ result: res.split(";") });
          }
      }
  });
}

const merge = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a];
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
  return c;
}

// 定义DNS地址和类型
let tencentIPv4 = 'http://119.29.29.29/d?type=a&dn=';
let tencentIPv6 = 'http://119.29.29.29/d?type=aaaa&dn=';
let aliIPv4 = 'https://223.5.5.5/resolve?type=1&short=1&name=';
let aliIPv6 = 'https://223.5.5.5/resolve?type=28&short=1&name=';

// 构建域名
let domain = $domain;

// 创建Promise数组
let promises = [
  new Promise(resolve => dnsQuery(tencentIPv4 + domain, resolve)),
  new Promise(resolve => dnsQuery(tencentIPv6 + domain, resolve)),
  new Promise(resolve => dnsQuery(aliIPv4 + domain, resolve)),
  new Promise(resolve => dnsQuery(aliIPv6 + domain, resolve))
];

// 所有Promise都完成后执行处理
Promise.all(promises).then(function(results) {
  // 处理结果
  let valuesArray = Object.values(results);

  let addressResult = [];
  valuesArray.forEach(function(value) {
      if(value != null && value.result.length > 0 && value.result[0] !== "0" && value.result[0] !== ""){
          addressResult = merge(addressResult, value.result);
      }
  });
  
  $done({addresses: addressResult, ttl: addressResult.length ? 3600 : 2 });
});
