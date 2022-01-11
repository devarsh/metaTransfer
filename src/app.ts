import oracledb from 'oracledb';
import { metaDataDiffGenerator } from './utils';
import fs from 'fs';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.initOracleClient({ libDir: '/Users/devarshshah/Downloads/instantclient_19_8' });
oracledb.fetchAsString = [oracledb.CLOB];

async function run() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: 'EASY_CRM',
      password: 'SUPERACUTE',
      connectString: '10.55.6.62/RATNAFIN',
    });

    const results = await connection.execute(
      `select (case when grade_tran_cd is not null then 'business' else 'credit' end) as view1 ,tran_cd, sr_cd, category, empl_cd, new_form, edit_form, view_form from crm_los_product_form_metadata where category not in ('tabs')`,
      []
      // `select tran_cd, sr_cd, category, new_form, edit_form, view_form from crm_los_product_form_metadata where tran_cd = :tran_cd and sr_cd = :sr_cd and category = :category and emp_cd = :emp_cd category not in('tabs') and ${queryParam}`,
      // [tran_cd, sr_cd, category, emp_cd] // bind value for :id
    );
    fs.mkdirSync(`./out/`, { recursive: true });
    let newForm, viewForm, editForm, trancd, srcd, category, emp_cd, view;
    for (const result of results.rows) {
      try {
        view = result.VIEW1;
        trancd = result.TRAN_CD;
        srcd = result.SR_CD;
        category = result.CATEGORY;
        emp_cd = result.EMPL_CD;
        newForm = JSON.parse(result.NEW_FORM);
        viewForm = JSON.parse(result.VIEW_FORM);
        editForm = JSON.parse(result.EDIT_FORM);

        let combinedOutput = metaDataDiffGenerator(newForm, viewForm, editForm);
        let fileoutput = JSON.stringify(combinedOutput, null, 2);
        fileoutput = `export const ${category}_${trancd}_${srcd}_${emp_cd ?? '00'}_${view} = ${fileoutput}`;
        fs.writeFileSync(`./out/${trancd}-${srcd}-${category}-${emp_cd ?? '00'}-${view}.ts`, fileoutput);
      } catch (err) {
        console.error(err);
        fs.writeFileSync(`./out/${trancd}-${srcd}-${category}-${emp_cd ?? '00'}-${view}.ts`, `export const metaData = 'error'`);
      }
    }
    let content: string = '';
    let stmt: string = 'const mapper = {';

    let fn: string = `export const getMetaData = ({tranCD,SRCD,category,empCD,view}) => {
      return mapper[\`\${category}_\${tranCD}_\${SRCD}_\${empCD??'00'}_\${view}\`]
    }`;

    for (const result of results.rows) {
      const trancd = result.TRAN_CD;
      const srcd = result.SR_CD;
      const category = result.CATEGORY;
      const emp_cd = result.EMPL_CD;
      content = `${content}\nimport {${category}_${trancd}_${srcd}_${
        emp_cd ?? '00'
      }_${view}} from './${trancd}-${srcd}-${category}-${emp_cd ?? '00'}-${view}'`;

      stmt = `${stmt}\n'${category}_${trancd}_${srcd}_${emp_cd ?? '00'}_${view}':${category}_${trancd}_${srcd}_${
        emp_cd ?? '00'
      }_${view},`;
    }
    stmt = `${stmt}}`;
    fs.writeFileSync(`./out/index.ts`, `${content}\n${stmt}\n${fn}`);
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

run();
