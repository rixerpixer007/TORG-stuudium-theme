plugins {
    id("com.android.application")
}

val releaseBuildRequested =
    gradle.startParameter.taskNames.any { taskName ->
        taskName.substringAfterLast(':').contains("Release", ignoreCase = true)
    }

val releaseKeystorePath = providers.environmentVariable("SINU_STUUDIUM_KEYSTORE_PATH").orNull
val releaseKeystorePassword =
    providers.environmentVariable("SINU_STUUDIUM_KEYSTORE_PASSWORD").orNull
val releaseKeyAlias =
    providers.environmentVariable("SINU_STUUDIUM_KEY_ALIAS").orElse("sinu-stuudium-release").get()
val releaseKeyPassword =
    providers.environmentVariable("SINU_STUUDIUM_KEY_PASSWORD").orNull
        ?: releaseKeystorePassword

if (releaseBuildRequested) {
    val missingVariables =
        buildList {
            if (releaseKeystorePath.isNullOrBlank()) add("SINU_STUUDIUM_KEYSTORE_PATH")
            if (releaseKeystorePassword.isNullOrBlank()) {
                add("SINU_STUUDIUM_KEYSTORE_PASSWORD")
            }
        }

    if (missingVariables.isNotEmpty()) {
        throw GradleException(
            "Release signing is not configured. Set ${missingVariables.joinToString()} in the current shell.",
        )
    }

    if (!file(requireNotNull(releaseKeystorePath)).isFile) {
        throw GradleException("The release keystore file does not exist at the configured path.")
    }
}

android {
    namespace = "io.github.rixerpixer007.stuudium"
    compileSdk = 37

    defaultConfig {
        applicationId = "io.github.rixerpixer007.stuudium"
        minSdk = 26
        targetSdk = 37
        versionCode = 4
        versionName = "0.1.0"
    }

    signingConfigs {
        if (releaseBuildRequested) {
            create("release") {
                storeFile = file(requireNotNull(releaseKeystorePath))
                storePassword = requireNotNull(releaseKeystorePassword)
                keyAlias = releaseKeyAlias
                keyPassword = requireNotNull(releaseKeyPassword)
            }
        }
    }

    buildTypes {
        release {
            if (releaseBuildRequested) {
                signingConfig = signingConfigs.getByName("release")
            }
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

val verifyMobileWebAssets = tasks.register("verifyMobileWebAssets") {
    val assetManifest = layout.projectDirectory.file("src/main/assets/mobile/asset-manifest.json")
    inputs.file(assetManifest)

    doLast {
        if (!assetManifest.asFile.isFile) {
            throw GradleException(
                "Android WebView assets are missing. Run `npm run build:mobile:web` from the repository root.",
            )
        }
    }
}

tasks.named("preBuild").configure {
    dependsOn(verifyMobileWebAssets)
}

dependencies {
    implementation("androidx.activity:activity-ktx:1.13.0")
    implementation("androidx.core:core-ktx:1.19.0")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.2.0")
    implementation("androidx.webkit:webkit:1.17.0")

    testImplementation("junit:junit:4.13.2")
}
