import validator from "validator";

export const getMobilePhoneLocale = (): validator.MobilePhoneLocale => {  
  return 'en-US';
}

export const getPostalLocale = (): validator.PostalCodeLocale => {  
  return 'US';
}

export const uid = (function(){
  let id = 0;
  return (prefix?: string) => {
    return prefix ? prefix + '-' + id : id + '';
  }
})()