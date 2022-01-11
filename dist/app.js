var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.initOracleClient({ libDir: '/Users/devarshshah/Downloads/instantclient_19_8' });
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let connection;
        try {
            connection = yield oracledb.getConnection({
                user: "EASY_CRM",
                password: 'SUPERACUTE',
                connectString: "10.55.6.62/RATNAFIN"
            });
            const result = yield connection.execute(`select new_form, edit_form, view_form from crm_los_product_form_metadata where tran_cd = :tran_cd and sr_cd = :sr_cd and category = :category and grade_tran_cd is null`, [2, 2, 'main']);
            console.log(result.rows);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            if (connection) {
                try {
                    yield connection.close();
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
    });
}
run();
//# sourceMappingURL=app.js.map