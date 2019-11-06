var path = require("path");
var fs = require("fs");

module.exports = function($logger, $projectData) {

    return new Promise(function(resolve, reject) {
        $logger.info("Configure firebase");
        let projectBuildGradlePath = path.join($projectData.platformsDir, "android", "build.gradle");
        if (fs.existsSync(projectBuildGradlePath)) {
            let buildGradleContent = fs.readFileSync(projectBuildGradlePath).toString();

            if (buildGradleContent.indexOf("fabric.io") === -1) {
                let repositoriesNode = buildGradleContent.indexOf("repositories", 0);
                if (repositoriesNode > -1) {
                    repositoriesNode = buildGradleContent.indexOf("}", repositoriesNode);
                    buildGradleContent = buildGradleContent.substr(0, repositoriesNode - 1) + '\t\tmaven { url "https://maven.fabric.io/public" }\n\t\tmaven { url "https://dl.bintray.com/android/android-tools" }\n' + buildGradleContent.substr(repositoriesNode - 1);
                }

                let dependenciesNode = buildGradleContent.indexOf("dependencies", 0);
                if (dependenciesNode > -1) {
                    dependenciesNode = buildGradleContent.indexOf("}", dependenciesNode);
                    // see https://docs.fabric.io/android/changelog.html
                    buildGradleContent = buildGradleContent.substr(0, dependenciesNode - 1) + '	    classpath "io.fabric.tools:gradle:1.26.1"\n' + buildGradleContent.substr(dependenciesNode - 1);
                }

            } else if (buildGradleContent.indexOf("https://dl.bintray.com/android/android-tools") === -1) {
                let repositoriesNode = buildGradleContent.indexOf("repositories", 0);
                if (repositoriesNode > -1) {
                    repositoriesNode = buildGradleContent.indexOf("}", repositoriesNode);
                    buildGradleContent = buildGradleContent.substr(0, repositoriesNode - 1) + '\t\tmaven { url "https://dl.bintray.com/android/android-tools" }\n' + buildGradleContent.substr(repositoriesNode - 1);
                }
            }

            let gradlePattern = /classpath ('|")com\.android\.tools\.build:gradle:\d+\.\d+\.\d+('|")/;
            let googleServicesPattern = /classpath ('|")com\.google\.gms:google-services:\d+\.\d+\.\d+('|")/;
            let latestGoogleServicesPlugin = 'classpath "com.google.gms:google-services:4.3.0"';
            if (googleServicesPattern.test(buildGradleContent)) {
                buildGradleContent = buildGradleContent.replace(googleServicesPattern, latestGoogleServicesPlugin);
            } else {
                buildGradleContent = buildGradleContent.replace(gradlePattern, function (match) {
                    return match + '\n        ' + latestGoogleServicesPlugin;
                });
            }

            fs.writeFileSync(projectBuildGradlePath, buildGradleContent);
        }

        let projectAppBuildGradlePath = path.join($projectData.platformsDir, "android", "app", "build.gradle");
        if (fs.existsSync(projectAppBuildGradlePath)) {
          let appBuildGradleContent = fs.readFileSync(projectAppBuildGradlePath).toString();
          if (appBuildGradleContent.indexOf("buildMetadata.finalizedBy(copyMetadata)") === -1) {
            appBuildGradleContent = appBuildGradleContent.replace("ensureMetadataOutDir.finalizedBy(buildMetadata)", "ensureMetadataOutDir.finalizedBy(buildMetadata)\n\t\tbuildMetadata.finalizedBy(copyMetadata)");
            appBuildGradleContent += `
task copyMetadata {
  doFirst {
      // before tns-android 5.2.0 its gradle version didn't have this method implemented, so pri
      android.applicationVariants.all { variant ->
          if (variant.buildType.name == project.selectedBuildType) {
              def task
              if (variant.metaClass.respondsTo(variant, "getMergeAssetsProvider")) {
                  def provider = variant.getMergeAssetsProvider()
                  task = provider.get();
              } else {
                  // fallback for older android gradle plugin versions
                  task = variant.getMergeAssets()
              }
              for (File file : task.getOutputs().getFiles()) {
                  if (!file.getPath().contains("/incremental/")) {
                      project.ext.mergedAssetsOutputPath = file.getPath()
                  }
              }
          }
      }
  }
  doLast {
    copy {
      if (!project.mergedAssetsOutputPath) {
        // mergedAssetsOutputPath not found fallback to the default value for android gradle plugin 3.4.0
        project.ext.mergedAssetsOutputPath = "$projectDir/build/intermediates/assets/" + project.selectedBuildType + "/out"
      }
      from "$projectDir/src/main/assets/metadata"
      into project.mergedAssetsOutputPath + "/metadata"
    }
  }
}`;
            fs.writeFileSync(projectAppBuildGradlePath, appBuildGradleContent);
          }
        }

        resolve();
    });
};
