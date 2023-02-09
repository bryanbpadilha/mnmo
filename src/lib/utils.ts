import validator from "validator";
import { Form, InputRadioGroup, InputTextbox } from "../components";

export function HandleError(callback?: Function) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        if (callback) callback(error);
        else throw error;
      }
    };

    return descriptor;
  };
}

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