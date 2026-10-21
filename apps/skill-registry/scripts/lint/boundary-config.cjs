const testFile = '(?:\\.(?:test|spec)\\.[cm]?[jt]sx?$|(?:^|/)__tests__/)';
const exact = value => `^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;

// Entries require a reviewed owner/reason and exact consumer/interface paths.
// They do not exempt a directory or remove any edge from reachability checks.
module.exports = function boundaryConfig(publicContracts = []) {
  const consumers = [...new Set(publicContracts.map(contract => contract.from))];
  const privateRule = (from, pathNot, name = 'no-private-cross-feature') => ({
    name, severity: 'error', from,
    to: { path: '^src/features/', pathNot },
  });
  for (const contract of publicContracts) {
    if (!contract.owner || !contract.reason || !/^src\/features\/[^/]+\/.+\.[cm]?[jt]sx?$/.test(contract.from) || !/^src\/features\/[^/]+\/.+\.[cm]?[jt]sx?$/.test(contract.to)) {
      throw new Error('Public contracts need exact feature files, an owner and a reason');
    }
  }
  return {
    forbidden: [
      { name: 'no-unresolved-local', severity: 'error', from: { path: '^src/' }, to: { path: '^(?:\\.|@/|src/)', couldNotResolve: true } },
      { name: 'feature-no-app', severity: 'error', from: { path: '^src/features/', pathNot: testFile }, to: { path: '^src/app/', reachable: true } },
      { name: 'shared-no-features-or-app', severity: 'error', from: { path: '^src/shared/', pathNot: testFile }, to: { path: '^src/(features|app)/', reachable: true } },
      privateRule({ path: '^src/features/([^/]+)/', pathNot: [testFile, ...consumers.map(exact)].join('|') }, '^src/features/$1/'),
      ...consumers.map((consumer, index) => privateRule(
        { path: exact(consumer), pathNot: testFile },
        [`^src/features/${consumer.split('/')[2]}/`, ...publicContracts.filter(contract => contract.from === consumer).map(contract => exact(contract.to))].join('|'),
        `no-private-cross-feature-contract-${index + 1}`,
      )),
      { name: 'production-no-tests', severity: 'error', from: { path: '^src/', pathNot: testFile }, to: { path: testFile, reachable: true } },
      { name: 'no-cross-feature-cycles', severity: 'error', from: { path: '^src/features/([^/]+)/', pathNot: testFile }, to: { path: '^src/features/', pathNot: '^src/features/$1/', circular: true } },
    ],
    options: {
      tsConfig: { fileName: 'tsconfig.json' },
      tsPreCompilationDeps: true,
      doNotFollow: { path: 'node_modules' },
      // Generated outputs are not roots of `src`; follow imported intermediates.
      // A blanket .next/out exclusion could conceal a production dependency path.
      exclude: { path: '(^|/)node_modules/' },
      enhancedResolveOptions: { extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'], conditionNames: ['import', 'require', 'node', 'default'] },
    },
  };
};
