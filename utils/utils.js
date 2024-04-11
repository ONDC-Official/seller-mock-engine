const { init } = require("./logger")
const yaml = require("js-yaml");
const axios = require("axios");
const operator = require("../operator/util.js");
const logger = init()

//we are getting the schemas from a url but we can get it from a local file as well

const resolveTemplate = (context, template, values) => {
  init();
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    try {
      var value = values[key];
      if (value && value["operation"]) {
        value = operator.evaluateOperation(context, value["operation"]);
      }
    } catch (error) {
      logger.error(
        `Unable to resolve ${context?.apiConfig?.callbacks?.default?.callback} api response,`,
        error
      );
      console.trace(error);
    }
    return value !== undefined ? value : match;
  });
};

const buildTemplate = (context, templateConfig) => {
  init();
  try {
    const template = yaml.dump(templateConfig.data);
    const template_dict = templateConfig.dict;
    let response = resolveTemplate(context, template, template_dict);
    response = yaml.load(response);

    return response;
  } catch (error) {
    logger.error(
      `Unable to build response ${context?.apiConfig?.callbacks?.default?.callback} api response,`,
      error
    );
  }
};

const formatted_error = (errors) => {
  error_list = [];
  let status = "";
  errors.forEach((error) => {
    if (
      !["not", "oneOf", "anyOf", "allOf", "if", "then", "else"].includes(
        error.keyword
      )
    ) {
      error_dict = {
        message: `${error.message}${
          error.params.allowedValues ? ` (${error.params.allowedValues})` : ""
        }${error.params.allowedValue ? ` (${error.params.allowedValue})` : ""}${
          error.params.additionalProperty
            ? ` (${error.params.additionalProperty})`
            : ""
        }`,
        details: error.instancePath,
      };
      error_list.push(error_dict);
    }
  });
  if (error_list.length === 0) status = "pass";
  else status = "fail";
  error_json = { errors: error_list, status: status };
  return error_json;
};

const dynamicReponse = (context) =>{
  const callback = context?.apiConfig?.callbacks
    if(Object.keys(callback).length>1){
      for (const payloads in callback ){
        if(payloads != "default"){
          const result = operator.evaluateOperation(context, callback[payloads].condition?.operation)
          if(result)
          {
            return callback[payloads]
          }   
        } 
      }
    }
    return callback['default']

}

module.exports = {
  resolveTemplate,
  buildTemplate,
  formatted_error,
  dynamicReponse
};
