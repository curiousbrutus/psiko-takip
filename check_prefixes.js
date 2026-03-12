const fs = require('fs');
const path = require('path');
const tables = ['users','user_sessions','gamification','mood_entries','journal_entries','test_submissions','assessment_tasks','assessment_results','collaborative_tasks','appointments','chat_messages','audit_log','system_config'];
const sqlKw = ['FROM ', 'JOIN ', 'INTO ', 'UPDATE ', 'TABLE ', 'REFERENCES '];
const exts = ['.ts','.js','.sql'];
const skipDirs = ['node_modules','.next','.git'];
const files = [];

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const fp = path.join(d, f);
    if (fs.statSync(fp).isDirectory()) {
      if (!skipDirs.includes(f)) walk(fp);
    } else if (exts.includes(path.extname(f))) {
      files.push(fp);
    }
  });
}
walk('.');

const hits = [];
files.forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    tables.forEach(t => {
      sqlKw.forEach(kw => {
        // Look for keyword followed EXACTLY by the table name (not psk_ebg_tablename)
        // The key: after the keyword, check that the next word starts with the table name but NOT with psk_ebg_
        const re = new RegExp(kw + '(?!psk_ebg_)' + t + '\\b', 'i');
        if (re.test(line)) {
          hits.push(`${f.replace(process.cwd(), '')}:${i+1} -> ${line.trim()}`);
        }
      });
    });
  });
});

if (hits.length === 0) {
  console.log('All CLEAR: No unprefixed table references found!');
} else {
  console.log('REMAINING UNPREFIXED TABLE REFERENCES:');
  hits.forEach(h => console.log(' -', h));
}
