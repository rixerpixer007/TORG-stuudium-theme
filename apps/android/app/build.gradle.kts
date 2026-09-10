plugins {
    id("com.android.application")
}

android {
    namespace = "io.github.rixerpixer007.stuudium"
    compileSdk = 37

    defaultConfig {
        applicationId = "io.github.rixerpixer007.stuudium"
        minSdk = 26
        targetSdk = 37
        versionCode = 1
        versionName = "0.1.0-beta"
    }

    buildTypes {
        release {
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
