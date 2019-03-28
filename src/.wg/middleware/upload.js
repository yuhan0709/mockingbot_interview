
const Apis = require('../../server/api/vadmin/request').default;
const Log = require('../../server/util/byted/log').default;
const formidable =  require('formidable');
const fs = require('fs');

const maxFileSize = 1 * 1024 * 1024 * 1024;

function ErrorMeta(error) {
  return { ResponseMetadata: { Error: { Code: error, Message: error } } };
}
function notNull(params, res, ...keys) {
  for (let i = 0; i < keys.length; i++) {
    if (!params[keys[i]]) {
      res.status(500);
      res.send(ErrorMeta(keys[i] + '不能为空'));
      return false;
    }
  }
  return true;
}
module.exports.uploadProducts = async (req, res) => {
  const logId = Log.genLogId(res);
  if (!notNull(req.query, res, 'ProductGroupId')) {
    return;
  }
  try {
    const form = new formidable.IncomingForm({
      maxFileSize,
    });
    form.parse(req, function(err, fields, files) {
      if (err) {
        Log.error({
          logId,
          message: `products upload error ${files.file.name} ${err}`
        });
        res.status(500).json({ status: -1, message: err });
        return;
      }
      if (files.file.path) {
        Log.info({
          logId,
          message: `products upload ${files.file.name}`
        });
        fs.readFile(files.file.path,'utf-8', async (err, data) => {
          if (err) {
            Log.error({
              logId,
              message: `products upload error ${files.file.name} ${err}`
            });
            res.status(500).json({ status: -1, message: err });
            return;
          }
          try {
            const pms = (await Apis.ListProduct({ ProductGroupId: req.query.ProductGroupId, Limit: 9999 },req.session.curUser,req,res)).Result.ProductMetadatas;
            const add = [], update = [];
            const products = JSON.parse(data).products;
            products.forEach((product, index) => {
              const price = {};
              if (typeof product.Price !== 'object') {
                price.Price = {
                  Func: 'simple',
                  Value: product.Price
                };
              }
              products[index] = { ...product, ...price };
              let exist = false;
              for (let i = 0; i < pms.length; i++) {
                if (
                  pms[i]
                    && pms[i].BillingMethodCombination.Region === product.Region
                    && pms[i].BillingMethodCombination.Az === product.Az
                    && pms[i].BillingMethodCombination.Flavor === product.Flavor
                ) {
                  products[index] = { ...product, ProductId: pms[i].Id, ...price };
                  pms[i] = false;
                  exist = true;
                  break;
                }
              }
              if (exist) {
                update.push(products[index]);
              } else {
                add.push(products[index]);
              }
            });
            await Apis.CreateProducts2({
              ProductGroupId: req.query.ProductGroupId,
              List: add
            }, req.session.curUser, req, res);
            await Apis.UpdateProducts2({
              ProductGroupId: req.query.ProductGroupId,
              List: update
            }, req.session.curUser, req, res);
            res.status(200).json({ status: 1 });
            Log.info({
              logId,
              message: `readed ${files.file.name}`
            });
          } catch (e) {
            res.status(500).json({ status: -1, message: e });
          }
          fs.unlink(files.file.path);
        });
      } else {
        const e = 'no file path';
        Log.error({
          logId,
          message: `products upload error ${files.file.name} ${e}`
        });
        res.status(500).json({ status: -1, message: e });
      }
    });
  } catch (e) {
    res.status(500).json({ status: -1, message: e });
  }
};