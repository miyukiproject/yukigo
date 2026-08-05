import { releaseVersion, releaseChangelog, releasePublish } from 'nx/release';
import { readCachedProjectGraph, readJsonFile, writeJsonFile } from '@nx/devkit';
import { join } from 'path';
import { execSync } from 'child_process';

async function runRelease() {
  console.log('Starting Nx Release process...');

  const { workspaceVersion, projectsVersionData } = await releaseVersion({});

  const graph = readCachedProjectGraph();
  const packageVersions: Record<string, string> = {};
  const updatedPkgPaths: string[] = []; // <-- Keep track of what we edit

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
      updatedPkgPaths.push(pkgPath);
    }
  }

  // Ensure our manual package.json edits are staged before the changelog commit
  if (updatedPkgPaths.length > 0) {
    execSync(`git add ${updatedPkgPaths.map(p => `"${p}"`).join(' ')}`);
    console.log('📦 Staged peerDependency updates.');
  }

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

  await releaseChangelog({ 
    projects: changedProjectNames,
    versionData: changedVersionData, 
    version: workspaceVersion 
  });

  await releasePublish({
    projects: changedProjectNames
  });
  
  console.log('✅ Release completed successfully!');
}

runRelease().catch((error) => {
  console.error('❌ Release failed:', error);
  process.exit(1);
});