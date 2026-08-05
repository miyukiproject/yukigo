import { releaseVersion, releaseChangelog, releasePublish } from 'nx/release';
import { readCachedProjectGraph, readJsonFile, writeJsonFile } from '@nx/devkit';
import { join } from 'path';

async function runRelease() {
  console.log('Starting Nx Release process...');

  // 1. Bump standard versions
  const { workspaceVersion, projectsVersionData } = await releaseVersion({});

  // 2. Intercept and update peerDependencies
  const graph = readCachedProjectGraph();
  const packageVersions: Record<string, string> = {};

  for (const [project, data] of Object.entries(projectsVersionData)) {
    const root = graph.nodes[project].data.root;
    const pkgPath = join(root, 'package.json');
    const pkgJson = readJsonFile(pkgPath);
    packageVersions[pkgJson.name] = data.newVersion;
  }

  for (const project of Object.keys(projectsVersionData)) {
    const root = graph.nodes[project].data.root;
    const pkgPath = join(root, 'package.json');
    const pkgJson = readJsonFile(pkgPath);
    let updated = false;

    if (pkgJson.peerDependencies) {
      for (const dep of Object.keys(pkgJson.peerDependencies)) {
        if (packageVersions[dep]) {
          const newRange = `^${packageVersions[dep]}`;
          if (pkgJson.peerDependencies[dep] !== newRange) {
            pkgJson.peerDependencies[dep] = newRange;
            updated = true;
            console.log(`🔄 Updated peerDependency: ${dep}@${newRange} in ${pkgJson.name}`);
          }
        }
      }
    }

    if (updated) {
      writeJsonFile(pkgPath, pkgJson);
    }
  }

  // 3. STRICTLY filter both the project list AND the version data
  const changedProjectNames: string[] = [];
  const changedVersionData: typeof projectsVersionData = {};

  for (const [project, data] of Object.entries(projectsVersionData)) {
    if (data.currentVersion === data.newVersion) {
      console.log(`⏩ Skipping ${project} because version remained ${data.newVersion}`);
    } else {
      changedProjectNames.push(project);
      changedVersionData[project] = data;
    }
  }

  if (changedProjectNames.length === 0) {
    console.log('⏩ No package versions were changed. Stopping release.');
    return;
  }

  // 4. Generate changelogs and create Git tags
  // By passing BOTH the filtered array and filtered data object, 
  // Nx will not complain about missing projects or try to tag unchanged ones.
  await releaseChangelog({ 
    projects: changedProjectNames,
    versionData: changedVersionData, 
    version: workspaceVersion 
  });

  // 5. Publish to npm
  await releasePublish({
    projects: changedProjectNames
  });
  
  console.log('✅ Release completed successfully!');
}

runRelease().catch((error) => {
  console.error('❌ Release failed:', error);
  process.exit(1);
});