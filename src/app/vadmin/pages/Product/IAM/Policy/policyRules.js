
function isJsonFormat (rule, str, callback){
  try {
    JSON.parse(str);
  } catch (e) {
    console.log(e);
    callback('格式错误！');
  }
  callback();
}
const PolicyNameRules = {
  rules: [
    { required: true,message: '名称不能为空', },
    { max: 64, message: '限制长度64字符' },
    { pattern: new RegExp(/^[a-zA-Z0-9+=,.@_-]{1,64}$/), message: '名字仅能包含英文大小写、数字、+=,.@-_' },
  ],
  validateFirst: true,
  // validateTrigger: 'onBlur'
};
const PolicyContentRules = {
  rules: [
    { required: true, message: '名称不能为空', },
    { validator: isJsonFormat, message: '格式错误' }
  ],
  validateFirst: true,
  // validateTrigger: 'onBlur'
};

export {
  PolicyNameRules,
  PolicyContentRules
};