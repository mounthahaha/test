//格式化带字母日期
export const formatLetter =(d:string) => {
  if(d.includes('d') || d.includes('D')) {
    return d.substring(0,d.length - 1) + '天'
  } else if  (d.includes('m') ||  d.includes('M')) {
    return   d.substring(0,d.length - 1)  + '月'
  } else {
    return   d.substring(0,d.length - 1)   + '年' 
  }
} 


