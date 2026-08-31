// DevERP
////// Command PhaseScriptExecution failed with a nonzero exit code
npx react-native codegen


// Multiple build creation with different Name + icon + package name

// --- android build ----
// ./gradlew --stop
// ./gradlew clean
// ./gradlew generateCodegenArtifactsFromSchema 
// cmd - gradlew assemble[BRAND_NAME]Release

 ` va`
// How to used - .env.clientA and .env.cientB ??

// How to run - clientA and clientB app ??
// gradlew installClientADebug -Pbrand=[BRAND_NAME]

Payroll Mobile App – API Documentation

d1ea2ea6-591c-4eba-9128-02b0e243614a
373b67afa904484cad3dd86e2c085176

d1ea2ea6-591c-4eba-9128-02b0e243614a
438acfebe5c442b4b5588be214318b93
91-3366-0874-5277
91336608745277@abdm
value="61f573de0c2943368e83eb5784dfaa92"

//// sandip 
dev Infinix ZERO 20
app-id 7c76cc5c-33ce-4a33-8426-3ac583bf26d8
fir c-2bQQzIRf2t5q8YzHfXXQ:APA91bFwMLVKqV3pzj3G8PyB2NN9B43Qq4uuODozl798BwmL41diKj9OL5qj6K1IJgT4UlYnkQtFDN8qOg4986nBFdF9GloL01na7TL-hqFN9Obh80Hfxf4

token respo - fc6979ac5e0e4560a1a0b9425f46a09c 
new token - 6b30f59259594a519dcc20c66ea9b84b


1. Authentication Flow

Step 1: getLink
curl --location 'https://support.deverp.net/devws/appcode.aspx/getLink' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=hg4u3v1lqcd000cgwcp35vyx' \
--data '{
    "code": "payroll"
}'

[ step 2. setAppID: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/setAppID' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "user": "suresh",
    "pass": "suresh",
    "appid": "appid",
    "firebaseid" : "firebaseid",
    "device": "device"
}'

[ step 3. getAuth: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getAuth' \
--header 'Content-Type: text/plain' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "appid":"",
    "device": ""
}'

[ step 4. getMenu: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getMenu' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "54da6bd990954c45a729d29210d23114"
}'

[ step 5. getDB: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getDB' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "54da6bd990954c45a729d29210d23114"
}'

[ step 6. getPage ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getPage' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "4203ce36b6a94d8e80bb497b860384c0",
    "page": "PropMst"
}'

[ step 7. getListData ----]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getListData' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "4203ce36b6a94d8e80bb497b860384c0",
    "page": "PropMst", "fd":"01-Apr-2024","td":"31-Aug-2025"
}'
//bc0d0d8843924c548c3b3d7c7b0f12ea

[ Attandanced - punch in]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/savePage' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa' \
--data '{
  "token": "51b35f3b6af242898bfc397607aad328",
  "page": "punhin",
  "data": "{\"ID\":\"51b35f3b6af242898bfc397607aad328\", \"EmployeeId\":\"51b35f3b6af242898bfc397607aad328\",\"InDate\":\"\",\"InImage\":\"\",\"InRemarks\":\"\",\"InLocation\":{\"lat\":\"\",\"long\":\"\"},\"CUID\":\"51b35f3b6af242898bfc397607aad328\"}"
}'

[ Attandanced - punch out]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/savePage' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa; ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa' \
--data '{
  "token": "51b35f3b6af242898bfc397607aad328",
  "page": "punhout",
  "data": "{\"ID\":\"51b35f3b6af242898bfc397607aad328\", \"EmployeeId\":\"51b35f3b6af242898bfc397607aad328\",\"OutDate\":\"\",\"OutImage\":\"\",\"OutRemarks\":\"\",\"OutLocation\":{\"lat\":\"\",\"long\":\"\"},\"CUID\":\"51b35f3b6af242898bfc397607aad328\"}"
}
'

[ get Drop-down ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getDDL' \
--header 'Content-Type: application/json' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "dtlid":"1081",
     "where": "PropTypeName=~Gender~"
}'

[ get Ajax ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getAjax' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa; ASP.NET_SessionId=yuhpy41xwsqjq2olhay4i3c0' \
--data '{
     "token": "d78134973d9b4697a2b3d5b8b2e87510",
     "dtlid":"1072",
     "where":"Status=~A~",
     "search": "dadfdfdfdd"
 }'

[ save page ]
//iPhone 13 82BAA029-A1FA-42AC-AEF9-3FC2758EA9FA
//iPhone 13 82BAA029-A1FA-42AC-AEF9-3FC2758EA9FA
curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/savePage' \
--header 'Content-Type: application/json' \
--data-raw '{
    "data": 
"{\"EMPID\":\"1\",\"EMPCode\":\"00001\",\"CardNo\":\"\",\"BranchID\":\"1\",\"DepartmentID\":\"2\",\"DesignationID\":\"1\",\"JoinDate\":\"1/1/2025 12:00:00 AM\",\"Title\":\"Mr\",\"FirstName\":\"Satishvvbnnnnhn\",\"MiddleName\":\"Kalpeshbhai\",\"LastName\":\"Prajapati\",\"BirthDate\":\"1/1/1980 12:00:00 AM\",\"Gender\":\"M\",\"Religion\":\"Hindu\",\"BloodGroup\":\"AB-\",\"MobileNo\":\"87410256394\",\"MobileNo2\":\"\",\"PhoneNo\":\"9905012345\",\"EmailID\":\"satishk@gmail.com\",\"EmailID2\":\"satish@gmail.com\",\"EmergencyContactNo\":\"0533123456\",\"WebSite\":\"https://dev.com\",\"Disabilities\":\"51\",\"DisabilitiesRemarks\":\"\",\"LinkedIn\":\"satish.linkedin\",\"Facebook\":\"satish80\",\"Twitter\":\"satish1980\",\"Instagram\":\"satish80\",\"GitHub\":\"satishgit80\",\"CurrentAddress\":\"Bodak-dev, Near AMTS Stand, Ahmedabad\",\"CurrentCityID\":\"48428\",\"CurrentDistrict\":\"AHMEDABAD\",\"CurrentState\":\"GUJARAT\",\"CurrentCountry\":\"INDIA\",\"CurrentPin\":\"380054\",\"Address\":\"Bodak-dev, Near AMTS Stand, Ahmedabad\",\"CityID\":\"48428\",\"District\":\"AHMEDABAD\",\"State\":\"GUJARAT\",\"Country\":\"INDIA\",\"Pin\":\"380054\",\"AdharNo\":\"854172653987\",\"PANNo\":\"HGTUG5417H\",\"BankName\":\"HDFC Bank\",\"ACNo\":\"87456125367\",\"IFSCCode\":\"HDFC102310\",\"NameInBankAccount\":\"SATISH KALPESHBHAI PRAJAPATI\",\"PFNo\":\"PFSATISH\",\"ESINo\":\"ESICSATISH\",\"GratutityFormNo\":\"GT123456\",\"Status\":\"A\",\"ResignDate\":\"\",\"ResignReason\":\"\",\"Remarks\":\"\",\"LastDate\":\"\",\"UserID\":\"0\",\"CUID\":\"1\",\"Image\":\"d_logo.png\",\"CDT\":\"1/18/2025 12:00:00 AM\",\"MUID\":\"6\",\"MDT\":\"27-Aug-2025 13:22:37\"}",
 "page": "EmployeeMaster",
"token": "8c4aaf0e74fd4338943162b3876b2c7d"
}'


[ Delete ] 

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageDelete' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remark":"1=1",
     "page": "EmployeeMaster"
}'

[ Auth ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageAuth' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'


[ DeAuth ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageDeAuth' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'


[ Cancel ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageCancel' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'

[ getLastPunchIn ] 

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getLastPunchIn' \
--header 'Content-Type: application/json' \
--data '{
    "token": "49d45d99eff64492b94f449238507c7c"
}'

[ syncLocation ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/syncLocation' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=ibj4tkc5ffzqbyp2xoni4pvt; ASP.NET_SessionId=2vj4yympr4l0kqag3xaxdcul' \
--data '{
    "token":"9eecfb8d7bbf4acba7568f21f078c9f5",
    "location":"45.5556,12.6655"
}'

     

1) Prerequisites (local)

Java JDK installed (openJDK 11+ recommended), Android SDK + platform tools, Android Studio or at least the Android build tools on PATH.

React Native CLI app (you said you already made a dummy app and not using Expo).

A Google account you’ll use to register as a Play developer.

(If you need help installing Android SDK / JDK I can paste commands — say the OS.)

2) Create a Google Play Developer account (one-time)

Sign up at the Play Console and pay the one-time registration fee (US$25 approx). You’ll also provide developer name and contact info. 
Google Support

Link: use Play Console signup when ready (Play Console help / Get started).

3) Prepare your app for release (source changes)

Bump versionName & versionCode in android/app/build.gradle (defaultConfig):

defaultConfig {
  applicationId "com.yourcompany.yourapp" // must be unique
  minSdkVersion rootProject.ext.minSdkVersion
  targetSdkVersion rootProject.ext.targetSdkVersion
  versionCode 1        // increment this for every upload
  versionName "1.0.0"  // visible to users
}


Always increment versionCode for every new upload. 
Android Developers

Unique applicationId / package name — Play requires each app’s package name be unique (you set this when you created the project). If you ever change it after publishing you’ll create a new app on Play.

Remove debug-only code/configs (dev servers, debug flags) and verify app works in release mode on device/emulator.

4) Create an upload key (keystore) — you control this

You need a keystore (upload key). Keep it and its passwords SAFE and back them up (Play cannot restore lost keystores easily).

Command (run in terminal):

# example — change alias/keystore name and passwords to your own values
keytool -genkey -v -keystore my-upload-key.jks -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000


This will prompt for passwords and metadata. (Works on macOS / Linux / Windows with Java's keytool available.) 
React Native

Then move the generated my-upload-key.jks into your RN project android/app/ folder (or keep it safe elsewhere — but Gradle config below expects to find or reference it).

5) Configure Gradle so release builds are signed by your upload key

React Native docs recommend storing keystore properties in ~/.gradle/gradle.properties (or android/gradle.properties) and referencing them from android/app/build.gradle.

A. Add these to ~/.gradle/gradle.properties (or android/gradle.properties):

MYAPP_UPLOAD_STORE_FILE=my-upload-key.jks
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password_here


B. Add signing config to android/app/build.gradle (example snippet inside android { ... }):

signingConfigs {
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
buildTypes {
    release {
        // Make sure you keep minify / proguard settings as desired
        signingConfig signingConfigs.release
        // minifyEnabled true/false depending on your needs
    }
}


This is the standard RN/Android way to point Gradle at your keystore. React Native docs explain this flow in detail. 
React Native

Important: for security, don’t check your *.jks or passwords into Git — add them to .gitignore and use secure storage/CI secrets.

6) Enroll in Play App Signing (Google Play signing)

For new apps, Play App Signing is mandatory: you upload an upload key (the one you created above) and Google will manage final app signing and distribution keys. Enroll when you create the app or during upload. 
Android Developers
Google Support

(Short version: you keep your upload key safe and upload the AAB signed with that upload key; Google manages the final signing key and distribution.)

7) Build the Android App Bundle (.aab)

Google Play requires/upload prefers AAB (Android App Bundle). From your RN project root:

# macOS / Linux
cd android
./gradlew bundleRelease

# Windows
cd android
gradlew.bat bundleRelease


When the build succeeds the AAB will be at:
android/app/build/outputs/bundle/release/app-release.aab — ready to upload to Play. 
React Native

8) Test the release build

Options:

Use Internal testing or Internal app sharing in Play Console (fastest way to get an installable link to testers). This avoids needing to produce APKs locally — upload the .aab to the internal track and invite testers. 
Google Play
Google Support

(Advanced) Use bundletool to generate device-specific APKs from the AAB and sideload — but internal testing is easier.

9) Create the app in Play Console & upload the AAB

Open Play Console → Create app → choose app name, language, app vs game, paid/free. (You picked up the dev account in step 2.) 
Google Support

Fill App Content (Policy) — privacy policy URL, data safety, target audience, content rating, ads declaration. These must be completed before publishing. 
Google Support
+1

Go to Release > Testing > Internal testing (or select Closed/Open testing or Production) → Create new release → upload the app-release.aab.

Review, save, and Start rollout to the chosen testing track.

Important: For the first upload you’ll be asked to accept Play App Signing if you haven’t already (see step 6). 
Android Developers

10) Store listing assets (required and common requirements)

Prepare and upload the following on the Play Console’s Store Listing page:

App icon (512×512 PNG, max 1MB).

Feature graphic (optional but recommended for promo).

Screenshots: at least 2 phone screenshots (JPEG or 24-bit PNG, no alpha). Google has specific rules: min dimension ~320 px, max 3840 px, aspect ratio constraints, and no extra device frames/text overlays in screenshots. See Play assets guidelines. 
Google Support
sommo.io

Upload clear screenshots that show actual app UI; prepare privacy policy URL and contact email.

11) Publish: internal → closed → production

Start with Internal testing to verify installs on real devices quickly. Once testers confirm, promote to Closed or Open testing, then to Production. Internal tests typically publish fast; production can take longer (hours → few days depending on review). 
Google Play
Google Support

12) After upload: checks & monitoring

Monitor Play Console for pre-launch reports, crash reports, ANRs, and policy issues.

If you push an update later, increment versionCode and build a new AAB (see step 3/7). 
Android Developers

13) Useful commands & troubleshooting tips

Generate keystore (again):

keytool -genkey -v -keystore my-upload-key.jks -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000


(Store the .jks and passwords safely.) 
React Native

Build AAB:

cd android
./gradlew bundleRelease


Output: android/app/build/outputs/bundle/release/app-release.aab. 
React Native

Check signing fingerprint (SHA-1):

keytool -list -v -keystore my-upload-key.jks -alias my-key-alias


(Needed for some APIs like Google Sign-In.) 
Google for Developers

Common errors

validateSigningRelease FAILED → signing config issue; check keystore path/password/alias and that Gradle properties are correct.

versionCode conflict → increase versionCode.

14) Quick publish checklist (before pressing Release)

Google Play Developer account active (paid + verified). 
Google Support

App bundle .aab built and signed with your upload key. 
React Native

VersionCode incremented. 
Android Developers

Store listing: title, short description, full description. 
Google Support

Graphics: 512×512 icon, screenshots (2+), feature graphic if used. 
Google Support

App content filled: privacy policy URL, data safety, content rating, target audience. 
Google Support
+1

 Enrolled in Play App Signing (new apps). 
Android Developers

Official references (open these while you publish)

React Native — Signed release / Publish to Play (how to create keystore, set gradle variables, build .aab). 
React Native

Android Developers — Upload your app to Play Console (Play App Signing is mandatory for new apps). 
Android Developers

Play Console — Get started with Play Console (developer account & fee). 
Google Support

Google Play — Play App Signing (upload vs app signing keys explanation). 
Google Support

Play Console — Add preview assets / screenshots requirements. 
Google Support

=
jarsigner -verify -verbose -certs app/build/outputs/bundle/release/app-release.aab

----
curl --location 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyBq-mlSjaQUB5bCbIcBUh8lEhQc5ClesgU' \
--header 'Content-Type: application/json' \
--data '{
  "contents":[{"parts":[{"text":"sale : 300, last month : 800 , current month : 100 check data and write short gretting message, maximum 1 or 2 line"}]}]
}'

base_url : "https://support.deverp.net/devws"

getLink : 

curl --location 'https://support.deverp.net/devws/appcode.aspx/getLink' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=jd30rho5n0cvlhmikafnk2ai' \
--data '{
  "code": "relinquo1"
}'
response d string : 
{
    "d": "{\"success\":1,\"name\":\"Relinquo Cloud ERP\",\"link\":\"https://relinquo.deverp.net/devws/\"}"
}

response : 
{
  "success": 1,
  "name": "Relinquo Cloud ERP",
  "link": "https://relinquo.deverp.net/devws/"
}

setAppId : "/setAppID"

curl --location 'https://support.deverp.net/devws/msp_api.aspx/setAppID' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=jd30rho5n0cvlhmikafnk2ai' \
--data '{
  "user": "sandip mori",
  "pass": "adgop8y",
  "appid": "appid",
  "firebaseid": "firebaseid",
  "device": "device"
}'

response d : 
{
    "d": "{\"userid\":\"113\",\"username\":\"Sandip Mori\",\"roleid\":\"6\",\"rolename\":\"HR-ADMIN\",\"mobileno\":\"8154877969\",\"emailid\":\"morisandip383@gmail.com\",\"fullname\":\"\",\"success\":\"1\",\"token\":\"87b2be6ba1b142c38593b3390c51e778\",\"validtill\":\"2026-03-20 15:52:40\"}"
}

response : 
{
  "userid": "113",
  "username": "Sandip Mori",
  "roleid": "6",
  "rolename": "HR-ADMIN",
  "mobileno": "8154877969",
  "emailid": "morisandip383@gmail.com",
  "fullname": "",
  "success": "1",
  "token": "dfab06677aee4c67930af61847cddff2",
  "validtill": "2026-03-20 15:53:39"
}

getAuth : "/getAuth"

curl --location 'https://support.deverp.net/devws/msp_api.aspx/getAuth' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=jd30rho5n0cvlhmikafnk2ai' \
--data '{
  "appid": "appid",
  "device": "device"
}'


response d : 
{
    "d": "{\"success\":1,\"token\":\"dfab06677aee4c67930af61847cddff2\",\"validTill\":\"2026-03-20 15:53:39\"}"
}

response : 
{
  "success": 1,
  "token": "dfab06677aee4c67930af61847cddff2",
  "validTill": "2026-03-20 15:53:39"
}

getMenu : "/getMenu"

curl --location 'https://support.deverp.net/devws/msp_api.aspx/getMenu' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=jd30rho5n0cvlhmikafnk2ai' \
--data '{
  "token": "dfab06677aee4c67930af61847cddff2"
}'

response d : 
{
    "d": "{\"success\":1,\"menus\":[{\"Name\":\"Allocate Team\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"Allocate Team\",\"Link\":\"AllocateTeam\",\"IsReport\":\"E\",\"Image\":\"\"},{\"Name\":\"App OTP\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"App OTP\",\"Link\":\"app/indexlist.html?APPRGLOG/\",\"IsReport\":\"A\",\"Image\":\"\"},{\"Name\":\"AppOTP Dev\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"AppOTP Dev\",\"Link\":\"app/indexlist.html?AppCode_Dev/\",\"IsReport\":\"A\",\"Image\":\"\"},{\"Name\":\"Attedance Report\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"Attedance Report\",\"Link\":\"app/indexlist.html?Attendance/\",\"IsReport\":\"R\",\"Image\":\"\"},{\"Name\":\"Exp Entry\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"Exp Entry\",\"Link\":\"userexp_app\",\"IsReport\":\"E\",\"Image\":\"\"},{\"Name\":\"Expense Report\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"Expense Report\",\"Link\":\"app/indexlist.html?EXPENSEREPORT/\",\"IsReport\":\"R\",\"Image\":\"\"},{\"Name\":\"Leave Apply\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"Leave Apply\",\"Link\":\"LeaveApp\",\"IsReport\":\"E\",\"Image\":\"\"},{\"Name\":\"Leave Auth\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"Leave Auth\",\"Link\":\"LeaveAprv\",\"IsReport\":\"A\",\"Image\":\"\"},{\"Name\":\"Leave Report\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"Leave Report\",\"Link\":\"app/indexlist.html?LeaveReport/\",\"IsReport\":\"R\",\"Image\":\"\"},{\"Name\":\"Temp IPS Approve\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"Temp IPS Approve\",\"Link\":\"app/indexlist.html?TempIPS_Admin/\",\"IsReport\":\"A\",\"Image\":\"\"},{\"Name\":\"User Expense\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"User Expense\",\"Link\":\"app/indexlist.html?userexp/\",\"IsReport\":\"R\",\"Image\":\"\"},{\"Name\":\"White List IP\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"White List IP\",\"Link\":\"app/indexlist.html?TempIPS/\",\"IsReport\":\"E\",\"Image\":\"\"},{\"Name\":\"WORKS REPORT\",\"Data\":\"Menu\",\"Datas\":[],\"Title\":\"WORKS REPORT\",\"Link\":\"app/indexlist.html?Works/\",\"IsReport\":\"R\",\"Image\":\"\"}]}"
}

getDB : "/getDB" 

OnBoarding screen
  3-4 step : static data

App login 

  compny code
  user name
  password 

Full screen loader 

  Company logo

Home

  Drawer 

  chart board : numeric number 
  html 
  normal text

  menu actions 

  Refresh
  Search
  Toggle list
  Filter 
    Date : From and To date
    Branch 
    Type
  Full screen




- OnBoarding - Done
- Login - Done
- List filter ui - Done 
- Date picker - crashed - Done 
- List hori/verticler - crashed  - Done
- Menu tab - rotate - crashed - Done
- Page hori/verticler - crashed - Done
- My attendace list ui - pending - hori/vertical - Done

- Custome Drop down - list cut 

- NEW - Pre-selected branch and type - home tab [manish]
- NEW - calculation - script - [Aashutosh]
- NEW - Exit app modal
- NEW - Reach us - modal
- NEW - App ratting 

- Passed Branch id instead of Branch name - home tab filter
- Passed Type id instead of Type name - home tab filter 

- Image size compress

- Drop down / Ajax / date - RESET - CLEAR - ALL RESET 
- Firebase push notification - 
- APN setup ios pending 

///// Branch wise - entry list 


////////////////////// Attendaced 4 LAYER /////////////////////////

- 0 - No Location - No Face 
- 1 - No Location - Only Face 
- 2 - YES Location - YES Face 
- 3 - YES Location - YES Face - YES Face Matched

//////////////////////





import React, { useEffect, useState, useRef } from "react";
import {
  PermissionsAndroid,
  Platform,
  NativeModules,
  AppState,
  Linking,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  checkAuthStateThunk,
  getERPAppConfigMenuThunk,
} from "../store/slices/auth/thunk";
import DevERPService from "../services/api/deverp";
import AuthNavigator from "./AuthNavigator";
import StackNavigator from "./StackNavigator";
import FullViewLoader from "../components/loader/FullViewLoader";
import DeviceInfo from "react-native-device-info";
import CustomAlert from "../components/alert/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ERP_COLOR_CODE } from "../utils/constants";
import { changeLanguage } from "../i18n";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { getLastPunchInThunk } from "../store/slices/attendance/thunk";
import { setReloadApp } from "../store/slices/reloadApp/reloadAppSlice";
import {
  updateAppMenuList,
  updateAttendanceState,
  updatePinVerifyLoadedState,
} from "../store/slices/auth/authSlice";
import { useTranslation } from "react-i18next";

// ------------------------- Location Permission Helper -------------------------
export async function requestLocationPermissions(): Promise<
  "granted" | "foreground-only" | "denied" | "blocked"
> {
  if (Platform.OS === "android") {
    const fine = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (fine === PermissionsAndroid.RESULTS.GRANTED) {
      // Ask background AFTER foreground
      const background = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );

      return background === PermissionsAndroid.RESULTS.GRANTED
        ? "granted"
        : "foreground-only";
    }

    if (fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return "blocked";
    }

    return "denied";
  }

  // -------------------- iOS --------------------
  const whenInUse = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

  if (whenInUse === RESULTS.GRANTED || whenInUse === RESULTS.LIMITED) {
    const always = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
    return always === RESULTS.GRANTED ? "granted" : "foreground-only";
  }

  if (whenInUse === RESULTS.BLOCKED) {
    return "blocked";
  }

  return "denied";
}

// ------------------------- RootNavigator -------------------------
const RootNavigator = () => {
  let ATTENDANCE_LEVEL = 1;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const LOCATION_MESSAGES = {
    PERMISSION_DENIED: t("text1"),
    SERVICE_DISABLED: t("text2"),
  };
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { isLoading, isAuthenticated, accounts, user, appColorCode } =
    useAppSelector((state) => state.auth);
  const { reLoading } = useAppSelector((state) => state.reloadApp);

  const langCode = useAppSelector((state) => state.theme.langcode);

  const [alertVisible, setAlertVisible] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const [backgroundDeniedModal, setBackgroundDeniedModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "error" as "error" | "success" | "info" | "location",
  });

  const locationModalShownRef = useRef(false);
  const appState = useRef(AppState.currentState);

  const locationServiceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gpsModalShownRef = useRef(false);

  const checkLocationServiceOnly = async () => {
    if (!isAuthenticated) return;

    const enabled = await DeviceInfo.isLocationEnabled();

    // GPS OFF → show modal once & stop features
    if (!enabled && !gpsModalShownRef.current) {
      setAlertConfig({
        title: t("test3"),
        message: LOCATION_MESSAGES.SERVICE_DISABLED,
        type: "location",
      });

      setAlertVisible(true);
      setOpenSettings(false);
      setBackgroundDeniedModal(false);

      gpsModalShownRef.current = true;
      locationModalShownRef.current = true; // reuse existing stop-flow logic
      return;
    }

    // GPS ON again → reset flags & resume
    if (enabled && gpsModalShownRef.current) {
      gpsModalShownRef.current = false;
      locationModalShownRef.current = false;
      setAlertVisible(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Start checking every 1 second
    locationServiceIntervalRef.current = setInterval(() => {
      if (ATTENDANCE_LEVEL !== 0) {
        try {
          dispatch(getLastPunchInThunk())
            .unwrap()
            .then((res) => {
              if (res?.success === 1 || res?.success === "1") {
                dispatch(updateAttendanceState(true));
                checkLocationServiceOnly();
              } else {
                dispatch(updateAttendanceState(false));
              }
            })
            .catch((err) => {
              dispatch(updateAttendanceState(false));
            });
        } catch (error) {
          dispatch(updateAttendanceState(false));

          console.log("error ", error);
        }
      }
    }, 1000);

    return () => {
      // Cleanup on logout / unmount
      if (locationServiceIntervalRef.current) {
        clearInterval(locationServiceIntervalRef.current);
        locationServiceIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, reLoading]);
  const app_id = user?.app_id;

  useEffect(() => {
    if (isAuthenticated) {
      try {
        dispatch(getERPAppConfigMenuThunk());
      } catch (error) {
        dispatch(updateAppMenuList([])); // Clear menu on error
        console.log("Error fetching app config menu:", error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchDeviceName = async () => {
      const name = await DeviceInfo.getDeviceName();
      let appid = await AsyncStorage.getItem("appid");
      if (!appid) {
        appid = app_id;
        await AsyncStorage.setItem("appid", appid || "");
      }
      await AsyncStorage.setItem("device", name);

      DevERPService.initialize();
      DevERPService.setAppId(appid || "");
      DevERPService.setDevice(name);

      dispatch(checkAuthStateThunk());
    };
    fetchDeviceName();
  }, [dispatch]);

  // ------------------------- AppState Listener -------------------------
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (ATTENDANCE_LEVEL !== 0) {
          try {
            dispatch(getLastPunchInThunk())
              .unwrap()
              .then((res) => {
                if (res?.success === 1 || res?.success === "1") {
                  dispatch(updateAttendanceState(true));

                  checkLocation();
                } else {
                  dispatch(updateAttendanceState(false));
                }
              })
              .catch((err) => {
                dispatch(updateAttendanceState(false));
              });
          } catch (error) {
            dispatch(updateAttendanceState(false));

            console.log("error*******", error);
          }
        }
      }
      appState.current = nextAppState;
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [isAuthenticated, reLoading]);

  // ------------------------- Language -------------------------
  useEffect(() => {
    changeLanguage(langCode);
  }, [langCode]);

  // ------------------------- Device Setup -------------------------
  const init = async () => {
    const name = await DeviceInfo.getDeviceName();
    await AsyncStorage.setItem("device", name);
    await DevERPService.initialize();
    await dispatch(checkAuthStateThunk());
  };

  // ------------------------- Check Location -------------------------
  const checkLocation = async () => {
    if (!isAuthenticated) return;

    const enabled = await DeviceInfo.isLocationEnabled();

    const permission = await requestLocationPermissions();

    if (enabled && permission === "granted") {
      locationModalShownRef.current = false;
      setAlertVisible(false);
      setBackgroundDeniedModal(false);

      if (accounts.length) {
        const data = accounts
          .map((u) => {
            if (user?.id.toString() === u?.user?.id.toString()) {
              return {
                token: u.user.token,
                link: u.user.companyLink.replace(/^https:\/\//i, "http://"),
              };
            }
            return null;
          })
          .filter(Boolean);

        NativeModules.LocationModule.setUserTokens(data);
        NativeModules.LocationModule.startService();
      }
      return;
    }

    if (permission === "foreground-only") {
      setBackgroundDeniedModal(true);
      setAlertVisible(false);
      return;
    }

    // ------------------------- Denied / Disabled Handling -------------------------
    if (!locationModalShownRef.current) {
      // CASE 1: Location service disabled (GPS OFF)
      if (!enabled) {
        setAlertConfig({
          title: t("test3"),
          message: LOCATION_MESSAGES.SERVICE_DISABLED,
          type: "location",
        });

        setAlertVisible(true);
        setOpenSettings(false);
        setBackgroundDeniedModal(false); // ❌ no Open Settings modal
        locationModalShownRef.current = true;
        return;
      }

      // CASE 2: Permission denied or blocked
      if (permission === "denied" || permission === "blocked") {
        setAlertConfig({
          title: "Permission Denied",
          message: LOCATION_MESSAGES.PERMISSION_DENIED,
          type: "location",
        });

        setAlertVisible(true);
        setOpenSettings(true);
        setBackgroundDeniedModal(false); // ❌ background modal not needed here
        locationModalShownRef.current = true;
        return;
      }
    }
  };

  useEffect(() => {
    init();
    return () => {
      dispatch(setReloadApp());
      dispatch(updatePinVerifyLoadedState(false));
    };
  }, []);

  // ------------------------- Focus -------------------------
  useEffect(() => {
    if (isAuthenticated) {
      // Optional: cancel timeout if component unmounts
      const timer = setTimeout(() => {
        if (ATTENDANCE_LEVEL !== 0) {
          try {
            dispatch(getLastPunchInThunk())
              .unwrap()
              .then((res) => {
                if (res?.success === 1 || res?.success === "1") {
                  dispatch(updateAttendanceState(true));

                  checkLocation();
                } else {
                  dispatch(updateAttendanceState(false));

                  setAlertVisible(false);
                  setOpenSettings(false);
                  setBackgroundDeniedModal(false);
                  NativeModules.LocationModule.setUserTokens([]);
                  NativeModules.LocationModule.stopService();
                }
              })
              .catch((err) => {
                dispatch(updateAttendanceState(false));

                setAlertVisible(false);
                setOpenSettings(false);
                setBackgroundDeniedModal(false);
                NativeModules.LocationModule.setUserTokens([]);
                NativeModules.LocationModule.stopService();
              });
          } catch (error) {
            dispatch(updateAttendanceState(false));

            console.log("error//////", error);
          }
        }
      }, 2500);
      // Cleanup to avoid memory leaks
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, reLoading]);

  // ------------------------- Render -------------------------
  if (isLoading) return <FullViewLoader />;

  return (
    <>
      {isAuthenticated ? <StackNavigator /> : <AuthNavigator />}
      {ATTENDANCE_LEVEL !== 0 && isAuthenticated && (
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => {
            // setAlertVisible(true)
          }}
          isSettingVisible={openSettings}
          actionLoader={undefined}
          closeHide={true}
        />
      )}
      {ATTENDANCE_LEVEL !== 0 && isAuthenticated && (
        <Modal
          visible={backgroundDeniedModal}
          supportedOrientations={["portrait", "landscape"]}
          transparent
        >
          <View
            style={[
              styles.overlay,
              isLandscape && {
                alignContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <View style={[styles.modalContainer, {}]}>
              <Text style={styles.title}>{t("test21")}</Text>
              <Text style={styles.message}>{t("test22")}</Text>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => Linking.openSettings()}
              >
                <Text style={styles.btnText}>{t("test23")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default RootNavigator;

// ------------------------- Styles -------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "85%",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    padding: 12,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});


-----


import {
  View,
  Text,
  Image,
  TextInput,
  AppState,
  Animated,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import Geolocation from "@react-native-community/geolocation";

import { AttendanceFormValues, UserLocation } from "../types";
import {
  firstLetterUpperCase,
  requestCameraAndLocationPermission,
  requestCameraPermissionV2,
} from "../../../../utils/helpers";
import useTranslations from "../../../../hooks/useTranslations";
import { styles } from "../attendance_style";
import CustomAlert from "../../../../components/alert/CustomAlert";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { markAttendanceThunk } from "../../../../store/slices/attendance/thunk";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useNavigation } from "@react-navigation/native";
import SlideButton from "./SlideButton";
import { useBaseLink } from "../../../../hooks/useBaseLink";
import ProfileImage from "../../../../components/profile/ProfileImage";
import DeviceInfo from "react-native-device-info";
import { setReloadApp } from "../../../../store/slices/reloadApp/reloadAppSlice";
import { Easing } from "react-native";
import ImageBottomSheetModal from "../../../../components/bottomsheet/ImageBottomSheetModal";
import TranslatedText from "../../tabs/home/TranslatedText";
import { updateAttendanceState } from "../../../../store/slices/auth/authSlice";
import SlideButtonIOS from "./SlideButtonIOS";
import RNFS from "react-native-fs";
import ImageResizer from "@bam.tech/react-native-image-resizer";
import { launchCamera } from "react-native-image-picker";

const AttendanceForm = ({ setBlockAction, resData }: any) => {
  const { t } = useTranslations();

  let ATTENDANCE_LEVEL = 1;

  const [showModal, setShowModal] = useState(false);
  const [img, setImg] = useState("");
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user, attendanceDone: isAttendanceDone } = useAppSelector(
    (state) => state?.auth,
  );

  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const baseLink = useBaseLink();
  const theme = useAppSelector((state) => state?.theme.mode);
  const [statusImage, setStatusImage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [attendanceDone, setAttendanceDone] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  const [modalClose, setModalClose] = useState(false);
  const [alertLocationVisible, setLocationAlertVisible] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
  });
  const [alertMapVisible, setAlertMapVisible] = useState(false);

  const [alertMapConfig, setAlertMapConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info" | "location",
  });
  // -------------------- Pending Camera Action --------------------
  const pendingCameraAction = useRef<{
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void;
    handleSubmit: () => void;
  } | null>(null);

  // -------------------- AppState Listener --------------------
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if(ATTENDANCE_LEVEL === 0) return;
        if (nextAppState === "active" && pendingCameraAction.current) {
           const hasPermission = await requestCameraAndLocationPermission();
            if (hasPermission) {
              setIsSettingVisible(false);
              setAlertVisible(false);
              const { setFieldValue, handleSubmit } =
                pendingCameraAction.current;
              pendingCameraAction.current = null;
              if(ATTENDANCE_LEVEL === 1){
            openCamera(setFieldValue, handleSubmit);
          } else {
            openCameraV2(setFieldValue, handleSubmit);
          }
            }
        }
      },
    );
    return () => subscription.remove();
  }, []);


  const openCamera = (setFieldValue, handleSubmit) => {

    if(ATTENDANCE_LEVEL === 0){
      setFieldValue(
                "imageBase64",
                 "",
              );

         setTimeout(() => {
              handleSubmit();
            }, 1000);
    }else{
      setLocationLoading(false);
    setBlockAction(false);
    navigation.navigate("FaceCameraScreen", {
      onCapture: async (photoPath) => {
        setTimeout(async () => {
          try {
            setLocationLoading(true);
            setBlockAction(true);
            if (!photoPath) {
              setLocationLoading(false);
              setBlockAction(false);
              return;
            }

            const photoUri = "file://" + photoPath;
            const compressedPhoto = await ImageResizer.createResizedImage(
              photoPath,
              600, // optional: adjust to safe dimensions
              600,
              "JPEG",
              60,
              0,
            );

            const base64 = await RNFS.readFile(compressedPhoto.uri, "base64");
            // const base64 = await RNFS.readFile(photoPath, "base64");

            if (base64) {
              setFieldValue(
                "imageBase64",
                `${
                  resData?.success === 1 || resData?.success === "1"
                    ? "punchOut.jpeg"
                    : "punchIn.jpeg"
                }; data:image/jpeg;base64,${base64}`,
              );
            }

            setStatusImage(photoUri);

            setTimeout(() => {
              handleSubmit();
            }, 1000);
          } catch (error) {
            console.log("---------------------11", error);

            setLocationLoading(false);
            setBlockAction(false);
          }
        }, 300);
      },
    });
    }

    
  };

  const openCameraV2 = (
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void,
    handleSubmit: () => void,
  ) => {
    launchCamera(
      {
        mediaType: "photo",
        cameraType: "back",
        quality: 0.7,
        includeBase64: true,
      },
      (response) => {
        if (response?.didCancel || response?.errorCode) {
          setLocationLoading(false);
          setBlockAction(false);
          return;
        }
        const photoUri = response?.assets?.[0]?.uri;
        const asset = response?.assets?.[0];
        if (!photoUri) return;
        if (asset?.base64) {
          setFieldValue(
            "imageBase64",
            `${
              resData?.success === 1 || resData?.success === "1"
                ? "punchOut.jpeg"
                : "punchIn.jpeg"
            }; data:${asset?.type};base64,${asset?.base64}`,
          );
        }
        setStatusImage(photoUri);
        setTimeout(() => {
          handleSubmit();
        }, 1000);
      },
    );
  };


  const handleStatusToggle = async (
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void,
    handleSubmit: () => void,
  ) => {
    const enabled = await DeviceInfo.isLocationEnabled();
    if (ATTENDANCE_LEVEL !== 0 && !enabled) {
      setBlocked(false);
      setLocationLoading(false);
      setAttendanceDone(false);
      setLocationAlertVisible(true);
      return;
    } else {
      setLocationAlertVisible(false);
    }
    setBlockAction(true);

    if (locationLoading) return;

    
    if(ATTENDANCE_LEVEL !== 0){
      const hasPermission = await requestCameraAndLocationPermission();

      if (!hasPermission) {
        pendingCameraAction.current = { setFieldValue, handleSubmit };
        setAlertConfig({
          title: t("errors.permissionRequired"),
          message: t("errors.cameraLocationPermission"),
          type: "error",
        });
        setModalClose(false);
        setAlertVisible(true);
        setIsSettingVisible(true);

        setBlockAction(false);
        return;
      }
    }

    setBlocked(false);
    setLocationLoading(true);

    const getLocationWithRetry = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position?.coords;

          setUserLocation({ latitude, longitude });
          setFieldValue("latitude", String(latitude));
          setFieldValue("longitude", String(longitude));
          if(ATTENDANCE_LEVEL === 1){
            openCameraV2(setFieldValue, handleSubmit);
          } else {
            openCamera(setFieldValue, handleSubmit);
          }
        },
        (error) => {
          console.log("-----------------------******", error);

          setAlertConfig({
            title: t("errors.locationError"),
            message: error?.message || t("msg.msg5"),
            type: "error",
          });
          setAlertVisible(true);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    };

    if (ATTENDANCE_LEVEL !== 0) {
      getLocationWithRetry();
    } else {
      console.log("Skipping location fetch due to attendance level 0");
      setFieldValue("latitude", "");
      setFieldValue("longitude", "");
      setFieldValue("imageBase64", "");
          setTimeout(() => {
        handleSubmit(); // ✅ yaha sahi hai
      }, 1000);
    }
  };

  const formatName = (name = "") =>
    name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const animProfile = useRef(new Animated.Value(20)).current;
  const animName = useRef(new Animated.Value(20)).current;
  const animRemark = useRef(new Animated.Value(20)).current;
  const animImage = useRef(new Animated.Value(20)).current;
  const animButton = useRef(new Animated.Value(20)).current;

  const fadeProfile = useRef(new Animated.Value(0)).current;
  const fadeName = useRef(new Animated.Value(0)).current;
  const fadeRemark = useRef(new Animated.Value(0)).current;
  const fadeImage = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(animProfile, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeProfile, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(animName, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeName, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(animRemark, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeRemark, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(animImage, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeImage, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(animButton, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeButton, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View
      style={{
        width: "100%",
        padding: 16,
      }}
    >
      <Formik
        initialValues={{
          name: user?.name,
          latitude: ATTENDANCE_LEVEL === 1 ? userLocation ? String(userLocation?.latitude) : "" : "",
          longitude: ATTENDANCE_LEVEL === 1 ? userLocation ? String(userLocation?.longitude) : "" : "",
          remark: "",
          dateTime: new Date().toISOString(),
          imageBase64: "",
        }}
        validationSchema={Yup.object({
          name: Yup.string().required(t("attendance.nameRequired")),
          longitude: Yup.string().optional(),
          remark: Yup.string().optional(),
          dateTime: Yup.string().optional(),
          imageBase64:  ATTENDANCE_LEVEL === 0 ?  Yup.string().optional() : Yup.string().required(t("msg.msg6")),
        })}
        onSubmit={(values) => {
          console.log("Submitting with values:", values);
          dispatch(
            markAttendanceThunk({
              rawData: values,
              type:
                resData?.success === 1 || resData?.success === "1"
                  ? false
                  : true,
              user,
              id:
                resData?.success === 1 || resData?.success === "1"
                  ? resData?.id
                  : "0",
            }),
          )
            .unwrap()
            .then((res) => {
              if (resData?.success === 1 || resData?.success === "1") {
                dispatch(updateAttendanceState(true));
              } else {
                dispatch(updateAttendanceState(false));
              }
              setAttendanceDone(true);
              setAlertConfig({
                title: t("title.title3"),
                message: t("msg.msg7"),
                type: "success",
              });
              setAlertVisible(true);
              setLocationLoading(false);
              setBlockAction(false);
              if(ATTENDANCE_LEVEL === 0){
                navigation.goBack();
                return;
              }
              setTimeout(() => {
                setAlertVisible(false);
                setAlertMapVisible(true);

                setAlertMapConfig({
                  title: "Location tracked status",
                  message: !isAttendanceDone
                    ? "Location tracking has started and will continue until you punch out."
                    : "Location tracking has been stopped.",
                  type: "location",
                });

                setTimeout(() => {
                  setAlertMapVisible(false);
                  navigation.goBack();
                }, 1500);
              }, 1100);
            })
            .catch((err) => {
              setAttendanceDone(false);
              setAlertConfig({
                title: t("title.title1"),
                message: err || t("msg.msg4"),
                type: "error",
              });
              setAlertVisible(true);
              setLocationLoading(false);
              setBlockAction(false);
            });
        }}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: theme === "dark" ? "black" : "transparent",
              },
            ]}
          >
            {isLandscape ? (
              <>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ width: "50%", justifyContent: "center" }}>
                    <View style={styles.profileRow}>
                      <View style={styles.imageCol}>
                        {`${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg` ? (
                          <TouchableOpacity
                            onPress={() => {
                              setImg(
                                `${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg`,
                              );
                              setShowModal(true);
                            }}
                          >
                            <Animated.View
                              style={{
                                opacity: fadeProfile,
                                transform: [{ translateY: animProfile }],
                              }}
                            >
                              <View style={styles.profileRow}>
                                <ProfileImage
                                  userId={user?.id}
                                  baseLink={baseLink}
                                  userName={firstLetterUpperCase(
                                    user?.name || "",
                                  )}
                                />
                              </View>
                            </Animated.View>
                          </TouchableOpacity>
                        ) : (
                          <View
                            style={[
                              styles.profileAvatar,
                              {
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
                              },
                            ]}
                          >
                            <Animated.View
                              style={{
                                opacity: fadeName,
                                transform: [{ translateY: animName }],
                              }}
                            >
                              <TranslatedText
                                text={firstLetterUpperCase(user?.name || "")}
                                numberOfLines={1}
                                style={{
                                  color: ERP_COLOR_CODE.ERP_WHITE,
                                  fontWeight: "bold",
                                  fontSize: 26,
                                }}
                              ></TranslatedText>
                            </Animated.View>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={{ width: "50%" }}>
                    <View style={{}}>
                      <Animated.View
                        style={{
                          opacity: fadeRemark,
                          transform: [{ translateY: animRemark }],
                        }}
                      >
                        <View style={styles.formGroup}>
                          <Text
                            style={[
                              styles.label,
                              theme === "dark" && {
                                color: "white",
                              },
                            ]}
                          >
                            {t("attendance.employeeName")}
                          </Text>
                          <TextInput
                            style={[
                              styles.input,
                              styles.inputReadonly,
                              theme === "dark" && {
                                borderWidth: 1,
                                borderColor: "white",
                                color: "black",
                                backgroundColor: "black",
                              },
                              {
                                backgroundColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                              },
                            ]}
                            value={formatName(values?.name)}
                            editable={false}
                          />
                          {touched?.name && errors?.name ? (
                            <TranslatedText
                              numberOfLines={1}
                              text={errors?.name}
                              style={styles.errorText}
                            ></TranslatedText>
                          ) : null}
                        </View>
                        <View style={styles.formGroup}>
                          <Text
                            style={[
                              styles.label,
                              theme === "dark" && {
                                color: "white",
                              },
                            ]}
                          >
                            {resData?.success === 1 || resData?.success === "1"
                              ? t("attendance.outremark")
                              : t("attendance.remark")}
                          </Text>

                          <TextInput
                            style={[
                              styles.input,
                              { minHeight: 100, textAlignVertical: "top" },
                              theme === "dark" && {
                                borderWidth: 1,
                                borderColor: "white",
                                color: "white",
                                backgroundColor: "black",
                              },
                            ]}
                            placeholderTextColor={
                              theme === "dark" ? "white" : "black"
                            }
                            value={values?.remark}
                            onChangeText={(text) =>
                              setFieldValue("remark", text)
                            }
                            placeholder={t("attendance.enterRemark")}
                            multiline
                            numberOfLines={3}
                          />
                        </View>
                      </Animated.View>
                      {statusImage && (
                        <View>
                          <Image
                            source={{ uri: statusImage }}
                            style={styles.selfyAvatar}
                          />
                          <Text style={styles.imageLabel}>
                            {t("attendance.capturedPhoto")}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Animated.View
                          style={{
                            opacity: fadeButton,
                            transform: [{ translateY: animButton }],
                          }}
                        >
                          <View>
                            {Platform.OS === "ios" ? (
                              <SlideButtonIOS
                                label={
                                  resData?.success === 1 ||
                                  resData?.success === "1"
                                    ? `${t("text.texti3")} ${t(
                                        "attendance.checkOut",
                                      )}`
                                    : `${t("text.texti3")} ${t(
                                        "attendance.checkIn",
                                      )}`
                                }
                                successColor={
                                  resData?.success === 1 ||
                                  resData?.success === "1"
                                    ? ERP_COLOR_CODE.ERP_ERROR
                                    : ERP_COLOR_CODE.ERP_APP_COLOR
                                }
                                loading={locationLoading}
                                completed={attendanceDone}
                                onSlideSuccess={() => {
                                  handleStatusToggle(
                                    setFieldValue,
                                    handleSubmit,
                                  );
                                }}
                              />
                            ) : (
                              <SlideButton
                                label={
                                  resData?.success === 1 ||
                                  resData?.success === "1"
                                    ? `${t("text.text3")} ${t(
                                        "attendance.checkOut",
                                      )}`
                                    : `${t("text.text3")} ${t(
                                        "attendance.checkIn",
                                      )}`
                                }
                                successColor={
                                  resData?.success === 1 ||
                                  resData?.success === "1"
                                    ? ERP_COLOR_CODE.ERP_ERROR
                                    : ERP_COLOR_CODE.ERP_APP_COLOR
                                }
                                loading={locationLoading}
                                completed={attendanceDone}
                                blocked={blocked}
                                onSlideSuccess={() => {
                                  handleStatusToggle(
                                    setFieldValue,
                                    handleSubmit,
                                  );
                                }}
                              />
                            )}
                          </View>
                        </Animated.View>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.profileRow}>
                  <View style={styles.imageCol}>
                    {`${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg` ? (
                      <TouchableOpacity
                        onPress={() => {
                          setImg(
                            `${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg`,
                          );
                          setShowModal(true);
                        }}
                      >
                        <Animated.View
                          style={{
                            opacity: fadeProfile,
                            transform: [{ translateY: animProfile }],
                          }}
                        >
                          <View style={styles.profileRow}>
                            <ProfileImage
                              userId={user?.id}
                              baseLink={baseLink}
                              userName={firstLetterUpperCase(user?.name || "")}
                            />
                          </View>
                        </Animated.View>
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={[
                          styles.profileAvatar,
                          {
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
                          },
                        ]}
                      >
                        <Animated.View
                          style={{
                            opacity: fadeName,
                            transform: [{ translateY: animName }],
                          }}
                        >
                          <TranslatedText
                            text={firstLetterUpperCase(user?.name || "")}
                            numberOfLines={1}
                            style={{
                              color: ERP_COLOR_CODE.ERP_WHITE,
                              fontWeight: "bold",
                              fontSize: 26,
                            }}
                          ></TranslatedText>
                        </Animated.View>
                      </View>
                    )}
                  </View>
                </View>

                <View style={{}}>
                  <Animated.View
                    style={{
                      opacity: fadeRemark,
                      transform: [{ translateY: animRemark }],
                    }}
                  >
                    <View style={styles.formGroup}>
                      <Text
                        style={[
                          styles.label,
                          theme === "dark" && {
                            color: "white",
                          },
                        ]}
                      >
                        {t("attendance.employeeName")}
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          styles.inputReadonly,
                          theme === "dark" && {
                            borderWidth: 1,
                            borderColor: "white",
                            color: "black",
                            backgroundColor: "black",
                          },
                          { backgroundColor: ERP_COLOR_CODE.ERP_BORDER_LINE },
                        ]}
                        value={formatName(values?.name)}
                        editable={false}
                      />
                      {touched?.name && errors?.name ? (
                        <TranslatedText
                          numberOfLines={1}
                          text={errors?.name}
                          style={styles.errorText}
                        ></TranslatedText>
                      ) : null}
                    </View>
                    <View style={styles.formGroup}>
                      <Text
                        style={[
                          styles.label,
                          theme === "dark" && {
                            color: "white",
                          },
                        ]}
                      >
                        {resData?.success === 1 || resData?.success === "1"
                          ? t("attendance.outremark")
                          : t("attendance.remark")}
                      </Text>

                      <TextInput
                        style={[
                          styles.input,
                          { minHeight: 100, textAlignVertical: "top" },
                          theme === "dark" && {
                            borderWidth: 1,
                            borderColor: "white",
                            color: "white",
                            backgroundColor: "black",
                          },
                        ]}
                        placeholderTextColor={
                          theme === "dark" ? "white" : "black"
                        }
                        value={values?.remark}
                        onChangeText={(text) => setFieldValue("remark", text)}
                        placeholder={t("attendance.enterRemark")}
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </Animated.View>
                  {statusImage && (
                    <View>
                      <Image
                        source={{ uri: statusImage }}
                        style={styles.selfyAvatar}
                      />
                      <Text style={styles.imageLabel}>
                        {t("attendance.capturedPhoto")}
                      </Text>
                    </View>
                  )}
                  <Animated.View
                    style={{
                      opacity: fadeButton,
                      transform: [{ translateY: animButton }],
                    }}
                  >
                    <View>
                      {Platform.OS === "ios" ? (
                        <SlideButtonIOS
                          label={
                            resData?.success === 1 || resData?.success === "1"
                              ? `${t("text.texti3")} ${t(
                                  "attendance.checkOut",
                                )}`
                              : `${t("text.texti3")} ${t("attendance.checkIn")}`
                          }
                          successColor={
                            resData?.success === 1 || resData?.success === "1"
                              ? ERP_COLOR_CODE.ERP_ERROR
                              : ERP_COLOR_CODE.ERP_APP_COLOR
                          }
                          loading={locationLoading}
                          completed={attendanceDone}
                          onSlideSuccess={() => {
                            handleStatusToggle(setFieldValue, handleSubmit);
                          }}
                        />
                      ) : (
                        <SlideButton
                          label={
                            resData?.success === 1 || resData?.success === "1"
                              ? `${t("text.text3")} ${t("attendance.checkOut")}`
                              : `${t("text.text3")} ${t("attendance.checkIn")}`
                          }
                          successColor={
                            resData?.success === 1 || resData?.success === "1"
                              ? ERP_COLOR_CODE.ERP_ERROR
                              : ERP_COLOR_CODE.ERP_APP_COLOR
                          }
                          loading={locationLoading}
                          completed={attendanceDone}
                          blocked={blocked}
                          onSlideSuccess={() => {
                            handleStatusToggle(setFieldValue, handleSubmit);
                          }}
                        />
                      )}
                    </View>
                  </Animated.View>
                </View>
              </>
            )}
          </View>
        )}
      </Formik>

      <ImageBottomSheetModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        imageUrl={img}
      />

      <CustomAlert
        visible={alertLocationVisible}
        title={t("title.title4")}
        message={t("msg.msg8")}
        type={"error"}
        onClose={() => {
          setBlocked(true);
          setAlertVisible(false);
          setTimeout(() => {
            setBlocked(false);
          }, 1000);
          setLocationLoading(false);
          setAttendanceDone(false);
          setLocationAlertVisible(false);
        }}
        actionLoader={undefined}
        isSettingVisible={false}
        closeHide={undefined}
      />

      <CustomAlert
        visible={alertMapVisible}
        title={alertMapConfig?.title}
        message={alertMapConfig?.message}
        type={alertMapConfig?.type}
        onClose={() => {
          navigation?.goBack();
          setAlertMapVisible(false);
          dispatch(setReloadApp());
        }}
        actionLoader={undefined}
        isSettingVisible={false}
        closeHide={undefined}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig?.title}
        message={alertConfig?.message}
        type={alertConfig?.type}
        onClose={() => {
          if (!modalClose) {
            if (attendanceDone) {
              navigation?.goBack();
              setAlertVisible(false);
            } else {
              setBlocked(true);
              setAlertVisible(false);
              setTimeout(() => {
                setBlocked(false);
              }, 1000);
            }
          }
        }}
        actionLoader={undefined}
        isSettingVisible={isSettingVisible}
        closeHide={undefined}
      />
    </View>
  );
};

export default AttendanceForm;

//https://azure.microsoft.com/en-in/pricing/free-services/
svg - onboarding screen
two times load - list page
sometime show NoData - on first load
list back - 
  search result 
  add new
  come back
   -- entered search clean - keep value
Update app version number - android and ios
web site load fail - ios

// same page config 
// --





import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Keyboard,
  Platform,
  PermissionsAndroid,
  AppState,
  useWindowDimensions,
} from "react-native";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getERPAppConfigMenuThunk,
  getERPPageThunk,
} from "../../../store/slices/auth/thunk";
import { savePageThunk } from "../../../store/slices/page/thunk";
import FullViewLoader from "../../../components/loader/FullViewLoader";
import NoData from "../../../components/no_data/NoData";
import ErrorMessage from "../../../components/error/Error";
import ERPIcon from "../../../components/icon/ERPIcon";
import ErrorModal from "./components/ErrorModal";
import CustomPicker from "./components/CustomPicker";
import Media from "./components/Media";
import Disabled from "./components/Disabled";
import Input from "./components/Input";
import CustomAlert from "../../../components/alert/CustomAlert";
import AjaxPicker from "./components/AjaxPicker";
import DateTimePicker from "react-native-modal-datetime-picker";
import {
  applyActionsToControls,
  applyFormula,
  evaluateRulesWithActions,
  parseCustomDatePage,
  requestCameraPermission,
  runDynamicRules,
} from "../../../utils/helpers";
import DateRow from "./components/Date";
import BoolInput from "./components/BoolInput";
import SignaturePad from "./components/SignaturePad";
import HtmlRow from "./components/HtmlRow";
import { useBaseLink } from "../../../hooks/useBaseLink";
import DateTimeRow from "./components/DateTimeRow";
import LocationRow from "./components/LocationRow";
import FilePickerRow from "./components/FilePicker";
import CustomMultiPicker from "./components/CustomMultiPicker";
import { ERP_COLOR_CODE } from "../../../utils/constants";
import BusinessCardView from "./components/BusinessCardImage";
import DeviceInfo from "react-native-device-info";
import useTranslations from "../../../hooks/useTranslations";
import VideoRecorder from "./components/VideoRecorder";
import ScanScreen from "./components/ScanScreen";
import BarCodeScan from "./components/BarCodeScan";
import TranslatedText from "../tabs/home/TranslatedText";
import { setReloadApp } from "../../../store/slices/reloadApp/reloadAppSlice";
import { updateAppMenuList } from "../../../store/slices/auth/authSlice";

type PageRouteParams = { PageScreen: { item: any } };

export async function requestLocationPermissions(): Promise<
  "granted" | "foreground-only" | "denied" | "blocked"
> {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        // PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ]);

      const fine = granted["android.permission.ACCESS_FINE_LOCATION"];
      const coarse = granted["android.permission.ACCESS_COARSE_LOCATION"];
      const background =
        granted["android.permission.ACCESS_BACKGROUND_LOCATION"];

      if (
        fine === PermissionsAndroid.RESULTS.GRANTED &&
        coarse === PermissionsAndroid.RESULTS.GRANTED &&
        background === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return "granted";
      }

      if (
        fine === PermissionsAndroid.RESULTS.GRANTED &&
        coarse === PermissionsAndroid.RESULTS.GRANTED &&
        background !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        return "foreground-only";
      }

      if (
        fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
        coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
        background === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      ) {
        return "blocked";
      }
      return "denied";
    } catch (err) {
      return "denied";
    }
  }
  return "granted";
}

const PageScreen = () => {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const baseLink = useBaseLink();
  const theme = useAppSelector((state) => state?.theme.mode);
  const { t } = useTranslations();
  const [buttonSave, setButtonSave] = useState(true);
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  const [controls, setControls] = useState<any[]>([]);
  const [errorsList, setErrorsList] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isValidate, setIsValidate] = useState(false);

  const [tapLoader, setTapLoader] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<any>({});

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const [activeDateTimeField, setActiveDateTimeField] = useState<string | null>(
    null,
  );
  const [activeDateTime, setActiveDateTime] = useState<string | null>(null);

  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);
  const [goBack, setGoBack] = useState(false);
  const [loader, setLoader] = useState(false);
  const [actionLoader, setActionLoader] = useState(false);
  const [actionSaveLoader, setActionSaveLoader] = useState(false);
  const [infoData, setInfoData] = useState<any>({});
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
  });

  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [modalClose, setModalClose] = useState(false);
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  const [myScript, setMyScript] = useState();

  console.log("myScript---------------------", myScript);
  const [backgroundDeniedModal, setBackgroundDeniedModal] = useState(false);

  const isCheckingPermission = useRef(false);
  const locationSyncInterval = useRef<NodeJS.Timeout | null>(null);
  const lastLocationEnabled = useRef<boolean | null>(null);
  const appState = useRef(AppState.currentState);
  const [scriptErrorMessage, setScriptErrorMessage] = useState<any>();
  const [isVisibleScriptError, setIsVisibleScriptError] = useState(false);

  const hasLocationField = controls.some(
    (item) =>
      item?.defaultvalue &&
      item?.defaultvalue === "#location" &&
      item?.visible === "0",
  );

  const hasMediaField = controls.some(
    (item) => item?.ctltype === "IMAGE" || item?.ctltype === "PHOTO",
  );

  useFocusEffect(
    useCallback(() => {
      setTapLoader(false);
      return () => {};
    }, [navigation]),
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const checkLocation = async () => {
      const enabled = await DeviceInfo.isLocationEnabled();
      setLocationEnabled(enabled);
    };

    checkLocation();

    interval = setInterval(checkLocation, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
    return true;
  };

  const startLocationSync = async () => {
    const enabled = await DeviceInfo.isLocationEnabled();
    if (!enabled) return;

    const hasPermission = await requestLocationPermission();
    const fullPermission = await requestLocationPermissions();

    if (fullPermission === "foreground-only") {
      setBackgroundDeniedModal(true);
      return;
    }

    if (
      !hasPermission ||
      fullPermission === "denied" ||
      fullPermission === "blocked"
    )
      return;

    if (locationSyncInterval.current)
      clearInterval(locationSyncInterval.current);

    checkLocation();
  };

  const checkLocation = async () => {
    try {
      const enabled = await DeviceInfo.isLocationEnabled();

      if (enabled !== locationEnabled) {
        setAlertConfig({
          title: t("title.title13"),
          message: enabled ? t("title.title14") : t("title.title15"),
          type: enabled ? "success" : "error",
        });
        setAlertVisible(!enabled);
        setModalClose(false);
        setLocationEnabled(enabled);
      }

      if (hasLocationField && enabled) {
        if (Platform.OS === "android") {
          const granted = await requestLocationPermissions();
          if (granted === "granted") {
            // location access
            setLocationVisible(true);
          } else if (granted === "foreground-only") {
            setBackgroundDeniedModal(true);
            setLocationVisible(true);
          }
        }
      }
    } catch (err) {
      setLocationVisible(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkPermissionsOnFocus = async () => {
        if (isCheckingPermission.current) return;
        isCheckingPermission.current = true;

        const hasPermission = await requestLocationPermission();
        const fullPermission = await requestLocationPermissions();

        if (hasPermission && fullPermission === "granted") {
          setAlertVisible(false);
          setIsSettingVisible(false);
          setModalClose(true);
          startLocationSync();
        } else if (hasPermission && fullPermission === "foreground-only") {
          setBackgroundDeniedModal(true);
        } else {
          setAlertConfig({
            title: t("title.title13"),
            message: t("title.title15"),
            type: "error",
          });
          setModalClose(false);

          setAlertVisible(true);
          setIsSettingVisible(true);
        }

        isCheckingPermission.current = false;
      };

      const subscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (nextAppState === "active" && hasLocationField) {
            checkPermissionsOnFocus();
          }
        },
      );

      if (hasLocationField) {
        checkPermissionsOnFocus();
      }

      return () => subscription.remove();
    }, []),
  );

  const route = useRoute<RouteProp<PageRouteParams, "PageScreen">>();
  const { item, title, id, isFromNew, url, pageTitle, isFromProfile }: any =
    route?.params;
  const isFromBusinessCard = route?.params?.isFromBusinessCard || false;

  const validateForm = useCallback(() => {
    setTapLoader(true);
    const validationErrors: Record<string, string> = {};
    const errorMessages: string[] = [];

    controls.forEach((ctrl) => {
      if (ctrl?.mandatory === "1" && !formValues[ctrl?.field]) {
        validationErrors[ctrl.field] = `${ctrl?.fieldtitle || ctrl?.field} ${t(
          "text.text43",
        )}`;
        errorMessages.push(
          `${ctrl?.fieldtitle || ctrl?.field} ${t("text.text43")}`,
        );
      }
    });

    setErrors(validationErrors);
    setErrorsList(errorMessages);
    setTimeout(() => {
      if (errorMessages?.length > 0) setShowErrorModal(true);
    }, 780);

    return errorMessages?.length === 0;
  }, [controls, formValues]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor:
          theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
      },
      headerBackTitle: "",
      headerTintColor: "#fff",
      headerTitle: () => (
        <View
          style={{ flexDirection: "row", alignItems: "center", maxWidth: 210 }}
        >
          <TranslatedText
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontSize: 18,
              fontWeight: "700",
              color: theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_WHITE,
            }}
            text={title || pageTitle || "Details"}
          ></TranslatedText>
          {isFromProfile === false && (
            <TranslatedText
              numberOfLines={1}
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: ERP_COLOR_CODE.ERP_WHITE,
                marginLeft: 4,
              }}
              text={
                isFromNew
                  ? `( ${t("text.text44")} )`
                  : `( ${t("text.text45")} )`
              }
            ></TranslatedText>
          )}
        </View>
      ),
      headerRight: () => (
        <>
          {!error && !isFromNew && (
            <ERPIcon
              name="refresh"
              isLoading={actionLoader}
              onPress={() => {
                setControls([]);
                setFormValues(null);
                setButtonSave(true);
                setActionLoader(true);
                fetchPageData();
                setErrors({});
                setErrorsList([]);
              }}
            />
          )}
          {controls.length > 0 && (
            <ERPIcon
              name="save-as"
              isLoading={actionSaveLoader || tapLoader}
              onPress={async () => {
                try {
                  setTapLoader(true);
                  if (myScript) {
                    let rules;

                    if (typeof myScript === "string") {
                      try {
                        rules = JSON.parse(myScript);
                      } catch (e) {
                        console.error("Invalid JSON from backend", e);
                        setTapLoader(false);
                        return;
                      }
                    } else {
                      rules = myScript;
                    }

                    const { actions, messages } = evaluateRulesWithActions(
                      rules,
                      formValues,
                    );
                    const hasButtonSaveEnable = actions.some(
                      (item) => item?.field === "buttonSave",
                    );
                    if (hasButtonSaveEnable) {
                      const hasButtonSaveEnable = actions.some(
                        (item) =>
                          item?.field === "buttonSave" &&
                          item.action === "enable",
                      );
                      const updatedControls = applyActionsToControls(
                        controls,
                        actions,
                      );
                      setControls(updatedControls);
                      setButtonSave(hasButtonSaveEnable);
                      if (!hasButtonSaveEnable) {
                        setTapLoader(false);
                        setScriptErrorMessage(messages);
                        setIsVisibleScriptError(true);
                        return;
                      }
                    }
                    const updatedControls = applyActionsToControls(
                      controls,
                      actions,
                    );
                    setControls(updatedControls);
                  }

                  const locationEnabled = hasLocationField
                    ? await DeviceInfo.isLocationEnabled()
                    : true;

                  const permissionStatus = hasLocationField
                    ? await requestLocationPermissions()
                    : "granted";

                  const hasCameraPermission = hasMediaField
                    ? await requestCameraPermission()
                    : true;

                  if (!hasCameraPermission && hasMediaField) {
                    setAlertVisible(true);
                    setModalClose(true);
                    setIsSettingVisible(true);
                    setAlertConfig({
                      title: t("title.title16"),
                      message: t("msg.msg15"),
                      type: "error",
                    });

                    return;
                  }

                  if (hasLocationField && !locationEnabled) {
                    setAlertConfig({
                      title: t("title.title13"),
                      message: t("title.title15"),
                      type: "error",
                    });
                    setAlertVisible(true);
                    setModalClose(true);
                    setIsSettingVisible(true);
                    return;
                  }

                  if (
                    hasLocationField &&
                    (permissionStatus === "denied" ||
                      permissionStatus === "blocked")
                  ) {
                    setAlertConfig({
                      title: t("title.title13"),
                      message: t("title.title15"),
                      type: "error",
                    });
                    setAlertVisible(true);
                    setModalClose(false);
                    return;
                  }

                  // ✅ Permissions are granted, proceed
                  setLocationVisible(true);
                  setActionSaveLoader(true);
                  setIsValidate(true);

                  if (validateForm()) {
                    const submitValues: Record<string, any> = {};
                    controls?.forEach((f) => {
                      if (f.refcol !== "1")
                        submitValues[f?.field] = formValues[f?.field];
                    });

                    try {
                      setLoader(true);
                      await dispatch(
                        savePageThunk({
                          page: url,
                          id,
                          data: { ...submitValues },
                        }),
                      ).unwrap();
                      setLoader(false);
                      setIsValidate(false);
                      try {
                        dispatch(getERPAppConfigMenuThunk());
                      } catch (error) {
                        dispatch(updateAppMenuList([])); // Clear menu on error
                        console.log("Error fetching app config menu:", error);
                      }
                      if (isFromProfile) {
                        setTimeout(() => {
                          dispatch(setReloadApp());
                        }, 1000);
                      }
                      fetchPageData();
                      setAlertConfig({
                        title: t("title.title17"),
                        message: t("title.title18"),
                        type: "success",
                      });
                      setAlertVisible(true);
                      setGoBack(true);

                      setTimeout(() => {
                        setAlertVisible(false);
                        navigation.goBack();
                      }, 1800);
                    } catch (err: any) {
                      setLoader(false);
                      setAlertConfig({
                        title: t("title.title17"),
                        message: err,
                        type: "error",
                      });
                      setAlertVisible(true);
                      setGoBack(false);
                    }
                  }

                  setActionSaveLoader(false);
                  setTimeout(() => {
                    setTapLoader(false);
                  }, 600);
                } catch (error) {
                  console.error("Save error:", error);
                  setTimeout(() => {
                    setTapLoader(false);
                  }, 600);
                  setActionSaveLoader(false);
                }
              }}
            />
          )}
        </>
      ),
    });
  }, [
    tapLoader,
    navigation,
    item?.name,
    id,
    controls,
    formValues,
    validateForm,
    goBack,
    alertVisible,
    loader,
    actionLoader,
    actionSaveLoader,
    buttonSave,
    error,
  ]);

  const parseBackendScript = (str) => {
    if (!str) return [];

    try {
      let cleaned = str.replace(/\n/g, "");
      cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
      return new Function(`return ${cleaned}`)();
    } catch (e) {
      console.log("❌ Parsing failed:", e);
      return [];
    }
  };

  const fetchPageData = useCallback(async () => {
    try {
      setError(null);
      setLoadingPageId(isFromNew ? "0" : id);
      const parsed = await dispatch(
        getERPPageThunk({ page: url, id: isFromNew ? 0 : id }),
      ).unwrap();
      console.log("script---++++++------------------++++++++++---", parsed);
      if (parsed?.script) {
        console.log("script---++++++++++++++++---", parsed?.script);
        setMyScript(parsed?.script);
      }

      if (!isFromNew) {
        setInfoData({
          id: id?.toString(),
          tableName: parsed?.table,
          title: parsed?.title,
        });
      }

      const pageControls = Array.isArray(parsed?.pagectl)
        ? parsed?.pagectl
        : [];
      const normalizedControls = pageControls?.map((c) => ({
        ...c,
        disabled: String(c?.disabled ?? "0"),
        visible: String(c?.visible ?? "1"),
        mandatory: String(c?.mandatory ?? "0"),
      }));

      setControls(normalizedControls);

      setFormValues((prev) => {
        const merged: any = { ...prev };
        normalizedControls.forEach((c) => {
          if (merged[c?.field] === undefined) {
            merged[c?.field] = c?.text ?? "";
          }
        });
        return merged;
      });
    } catch (e: any) {
      setError(JSON.stringify(e?.data) || "Failed to load page");
    } finally {
      setLoadingPageId(null);
      setTimeout(() => {
        setActionLoader(false);
      }, 10);
    }
  }, [dispatch, id, url]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleAttachment = (base64: string, val: any) => {
    console.log("base64", base64);
    setFormValues((prev) => {
      return { ...prev, [val]: base64 };
    });
  };

  const handleSignatureAttachment = (base64: string, val: any) => {
    setFormValues((prev) => {
      return { ...prev, [val]: base64 };
    });
  };

  const showDateTimePicker = (field: string, date: any) => {
    setActiveDateTimeField(field);
    setActiveDateTime(date);
    setDateTimePickerVisible(true);
  };

  const hideDateTimePicker = () => {
    setDateTimePickerVisible(false);
    setActiveDateTimeField(null);
  };

  const handleDateTimeConfirm = (date: Date) => {
    if (activeDateTimeField) {
      setFormValues((prev) => ({
        ...prev,
        [activeDateTimeField]: date.toISOString(),
      }));
    }
    hideDateTimePicker();
  };

  const safeParse = (data) => {
    if (!data) return [];

    if (typeof data === "object") return data; // already parsed ✅

    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.log("❌ Invalid JSON:", data);
        return [];
      }
    }

    return [];
  };

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const setValue = (val) => {
        console.log("SET VALUE START 👉", item?.field, val);

        setFormValues((prev) => {
          let updatedValues;

          if (typeof val === "object" && val !== null) {
            updatedValues = { ...prev, ...val };
          } else {
            updatedValues = { ...prev, [item.field]: val };
          }

          console.log(
            "Updated Values (before rules):",
            myScript,
            typeof myScript,
          );
          const parsed = safeParse(myScript);
          console.log("parsed-----------------", parsed);

          const safeRules = Array.isArray(parsed) ? parsed : [parsed];

          console.log("safeRules-----------------", safeRules);
          const result = runDynamicRules(safeRules, updatedValues, item.field);

          console.log("After Rules Values 👉", result.values);
          console.log("Actions 👉", result.actions);
          console.log("Messages 👉", result.messages);

          let finalValues = { ...result.values };

          result.actions.forEach((action) => {
            if (action?.action === "setValue" && action?.field) {
              finalValues[action.field] = action.value ?? "";
              console.log(`📝 setValue → ${action.field} = ${action.value}`);
            }
          });

          //   ===
          // 4️⃣ UPDATE CONTROLS
          //   ===
          if (result.actions?.length) {
            const updatedControls = applyActionsToControls(
              controls,
              result.actions,
            );
            setControls(updatedControls);
          }

          //   ===
          // 5️⃣ CLEAR ERROR
          //   ===
          setErrors((prevErr) => ({
            ...prevErr,
            [item.field]: "",
          }));

          console.log("FINAL VALUES ✅", finalValues);
          console.log("SET VALUE END  ==");

          return finalValues;
        });
      };

      const value =
        formValues[item?.field] === "#location"
          ? ""
          : formValues[item?.field] || formValues[item?.text] || "";

          console.log("item 0000000 ", item)
      if (item?.visible === "1") return null;

      let content = null;
      //BoolInput
      if (item?.ctltype === "BOOL") {
        const rawVal = formValues[item?.field] ?? item?.text;
        const boolVal = String(rawVal).toLowerCase() === "true";
        content = (
          <BoolInput
            label={item?.fieldtitle}
            value={boolVal}
            onChange={(val) => {
              setValue({ [item?.field]: val });
            }}
          />
        );
      }
      //----PENDING----CustomMultiPicker
      else if (item?.field === "---") {
        content = (
          <CustomMultiPicker
            isValidate={isValidate}
            label={item?.fieldtitle}
            selectedValue={value}
            dtext={item?.dtext || item?.text || ""}
            onValueChange={setValue}
            options={item?.options || []}
            item={item}
            errors={errors}
          />
        );
      }
      //FilePickerRow
      else if (item?.ctltype === "FILE") {
        content = (
          <FilePickerRow
            isValidate={isValidate}
            baseLink={baseLink}
            infoData={infoData}
            item={item}
            handleAttachment={handleAttachment}
            errors={errors}
          />
        );
      }
      //VideoRecorder
      else if (item?.ctltype === "VIDEO") {
        content = <VideoRecorder item={item} />;
      }
      //ScanScreen
      else if (item?.ctltype === "QRSCANNER" && item?.title === "QR Scan") {
        content = <ScanScreen item={item} />;
      }
      //BarCodeScan
      else if (
        item?.ctltype === "QRSCANNER" &&
        item?.title === "Barcode Scan"
      ) {
        content = <BarCodeScan item={item} />;
      }
      //LocationRow
      else if (item?.defaultvalue === "#location") {
        content = (
          <LocationRow
            locationVisible={locationVisible}
            isValidate={isValidate}
            locationEnabled={locationEnabled}
            item={item}
            setValue={setValue}
          />
        );
      }
      //HtmlRow
      else if (item?.defaultvalue === "#html") {
        content = (
          <View>
            <HtmlRow item={item} isFromPage={true} />
          </View>
        );
      }
      //SignaturePad
      else if (item?.ctltype === "IMAGE" && item?.field === "signature") {
        content = (
          <SignaturePad
            isValidate={isValidate}
            infoData={infoData}
            item={item}
            handleSignatureAttachment={handleSignatureAttachment}
          />
        );
      }
      //Media - BusinessCardView
      else if (
        item?.ctltype === "FILE" ||
        item?.ctltype === "IMAGE" ||
        item?.ctltype === "PHOTO"
      ) {
        content = (
          <>
            {isFromBusinessCard ? (
              <BusinessCardView
                baseLink={baseLink}
                infoData={infoData}
                setValue={setValue}
                controls={controls}
                item={item}
              />
            ) : (
              <Media
                isValidate={isValidate}
                baseLink={baseLink}
                infoData={infoData}
                item={item}
                isFromNew={isFromNew}
                handleAttachment={handleAttachment}
                errors={errors}
              />
            )}
          </>
        );
      }
      //Disabled
      else if (item?.disabled === "1" && item?.ajax !== 1) {
        content = <Disabled item={item} value={value} type={item?.ctltype} />;
      }
      //CustomPicker
      else if (item?.ddl && item?.ddl !== "" && item?.ajax === 0) {
        content = (
          <CustomPicker
            isForceOpen={true}
            isValidate={isValidate}
            label={item?.fieldtitle}
            selectedValue={value}
            dtext={item?.dtext || item?.text || ""}
            onValueChange={setValue}
            options={item?.options || []}
            item={item}
            errors={errors}
          />
        );
      }
      //AjaxPicker
      else if (item?.ddl && item?.ddl !== "" && item?.ajax === 1) {
        content = (
          <AjaxPicker
            isForceOpen={true}
            isValidate={isValidate}
            label={item?.fieldtitle}
            selectedValue={value}
            dtext={item?.dtext || item?.text || ""}
            onValueChange={setValue}
            options={item?.options || []}
            item={item}
            errors={errors}
            formValues={formValues}
          />
        );
      }
      //DATE
      else if (item?.ctltype === "DATE") {
        content = (
          <DateRow
            isValidate={isValidate}
            item={item}
            errors={errors}
            value={value}
            showDatePicker={showDatePicker}
            // setValue={setValue}
          />
        );
      }
      //DATETIME
      else if (item?.ctltype === "DATETIME") {
        content = (
          <DateTimeRow
            isValidate={isValidate}
            item={item}
            errors={errors}
            value={value}
            showDateTimePicker={showDateTimePicker}
          />
        );
      }
      //Input
      else {
        content = (
          <Input
            id={item?.fieldtitle}
            isValidate={isValidate}
            onFocus={() =>
              flatListRef.current?.scrollToIndex({ index, animated: true })
            }
            item={item}
            errors={errors}
            value={value}
            setValue={setValue}
          />
        );
      }
      //content
      return (
        <Animated.View
          entering={FadeInUp.delay(index * 70).springify()}
          layout={Layout.springify()}
          style={
            isLandscape && {
              width: "100%",
              flex: 1,
              marginRight: 8,
            }
          }
        >
          {content}
        </Animated.View>
      );
    },
    [formValues, errors, controls, locationEnabled, isLandscape],
  );

  const showDatePicker = (field: string, date: any) => {
    setActiveDateField(field);
    setActiveDate(date);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
    setActiveDateField(null);
  };

  const handleConfirm = (date: Date) => {
    if (!activeDateField) return;
    try {
      if (myScript) {
      setFormValues((prev) => {
        const updatedValues = {
          ...prev,
          [activeDateField]: date.toISOString(),
        };

        const parsed = safeParse(myScript);
        console.log("parsed", parsed)

        const safeRules = Array.isArray(parsed) ? parsed : [parsed];
        console.log("safeRules", safeRules, activeDateField)

        // const result = runDynamicRules(
        //   safeRules,
        //   updatedValues,
        //   item.field
        // );

        const result = runDynamicRules(
          safeRules,
          updatedValues,
          activeDateField,
        );

        console.log("result", result)

        return result.values;
      });

      hideDatePicker();
    } else {
      if (activeDateField) {
        setFormValues((prev) => ({
          ...prev,
          [activeDateField]: date.toISOString(),
        }));
      }
      hideDatePicker();
    }
    } catch (error) {
      console.log("error handleConfirm", error)
    }
  };

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (loadingPageId) {
    return <FullViewLoader isShowTop={theme === "dark" ? false : true} />;
  }
  return (
    <>
      {theme !== "dark" && (
        <View
          style={{
            height: Platform.OS === "ios" ? 16 : 6,
            width: "100%",
            backgroundColor:
              theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        ></View>
      )}
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor:
            theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
        }}
      >
        {loadingPageId ? (
          <FullViewLoader />
        ) : !!error ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
              backgroundColor:
                theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
            }}
          >
            <ErrorMessage message={error} isShowTop={false} />
          </View>
        ) : controls?.length > 0 ? (
          <>
            <View
              style={{
                flex: 1,
                height: Dimensions.get("screen").height,
                backgroundColor:
                  theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
              }}
            >
              <FlatList
                showsVerticalScrollIndicator={false}
                data={controls}
                key={
                  isLandscape
                    ? `${isLandscape}-landscape`
                    : `${isLandscape}-portrait`
                }
                ref={flatListRef}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: keyboardHeight }}
                keyboardShouldPersistTaps="handled"
                numColumns={isLandscape ? 2 : 1}
              />
            </View>
            <CustomAlert
              visible={alertVisible}
              title={alertConfig.title}
              message={alertConfig.message}
              type={alertConfig.type}
              onClose={() => {
                setTapLoader(false);
                if (modalClose) setAlertVisible(false);
              }}
              actionLoader={undefined}
              isSettingVisible={isSettingVisible}
              closeHide={undefined}
            />
            {loader && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 999,
                }}
              >
                <FullViewLoader />
              </View>
            )}
          </>
        ) : (
          <View
            style={[
              { flex: 1 },
              theme === "dark" && {
                backgroundColor: "black",
                width: "100%",
              },
            ]}
          >
            <NoData isShowTop={false} />
          </View>
        )}

        <ErrorModal
          visible={isVisibleScriptError}
          errors={scriptErrorMessage}
          onClose={() => {
            setTapLoader(false);
            setIsVisibleScriptError(false);
          }}
        />
        <ErrorModal
          visible={showErrorModal}
          errors={errorsList}
          onClose={() => {
            setTapLoader(false);
            setShowErrorModal(false);
          }}
        />

        {dateTimePickerVisible && Platform.OS === "ios" && (
          <DateTimePicker
            isVisible={dateTimePickerVisible}
            mode="datetime"
            display="spinner"
            is24Hour={false}
            date={
              activeDateTime ? parseCustomDatePage(activeDateTime) : new Date()
            }
            onConfirm={handleDateTimeConfirm}
            onCancel={hideDateTimePicker}
            cancelTextIOS="Cancel"
            confirmTextIOS="Done"
          />
        )}

        {datePickerVisible && Platform.OS === "ios" && (
          <DateTimePicker
            isVisible={datePickerVisible}
            mode="date"
            date={activeDate ? parseCustomDatePage(activeDate) : new Date()}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            display="spinner"
            is24Hour={false}
            cancelTextIOS="Cancel"
            confirmTextIOS="Done"
          />
        )}

        {Platform.OS !== "ios" && (
          <DateTimePicker
            isVisible={dateTimePickerVisible}
            mode="datetime"
            display="spinner"
            is24Hour={false}
            date={
              activeDateTime ? parseCustomDatePage(activeDateTime) : new Date()
            }
            onConfirm={handleDateTimeConfirm}
            onCancel={hideDateTimePicker}
            cancelTextIOS="Cancel"
            confirmTextIOS="Done"
          />
        )}

        {Platform.OS !== "ios" && (
          <DateTimePicker
            isVisible={datePickerVisible}
            mode="date"
            display="spinner"
            is24Hour={false}
            date={activeDate ? parseCustomDatePage(activeDate) : new Date()}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            cancelTextIOS="Cancel"
            confirmTextIOS="Done"
          />
        )}

        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => {
            setTapLoader(false);
            setAlertVisible(false);
            if (goBack) {
              navigation.goBack();
            }
          }}
          actionLoader={undefined}
          closeHide={undefined}
        />
      </View>
    </>
  );
};

export default PageScreen;






(Files content cropped to 300k characters, download full ingest to see more)
================================================
FILE: README.md
================================================
// DevERP

// Multiple build creation with different Name + icon + package name

// --- android build ----
// gradlew --stop
// gradlew clean
// gradlew generateCodegenArtifactsFromSchema 
// gradlew app:assembleRelease 
// cmd - gradlew assemble[BRAND_NAME]Release

// How to used - .env.clientA and .env.cientB ??

// How to run - clientA and clientB app ??
// gradlew installClientADebug -Pbrand=[BRAND_NAME]


Payroll Mobile App – API Documentation

1. Authentication Flow

Step 1: getLink
curl --location 'https://support.deverp.net/devws/appcode.aspx/getLink' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=hg4u3v1lqcd000cgwcp35vyx' \
--data '{
    "code": "payroll"
}'

[ step 2. setAppID: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/setAppID' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "user": "suresh",
    "pass": "suresh",
    "appid": "appid",
    "firebaseid" : "firebaseid",
    "device": "device"
}'

[ step 3. getAuth: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getAuth' \
--header 'Content-Type: text/plain' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "appid":"",
    "device": ""
}'

[ step 4. getMenu: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getMenu' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "54da6bd990954c45a729d29210d23114"
}'

[ step 5. getDB: ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getDB' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "54da6bd990954c45a729d29210d23114"
}'

[ step 6. getPage ---- ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getPage' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "4203ce36b6a94d8e80bb497b860384c0",
    "page": "PropMst"
}'

[ step 7. getListData ----]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getListData' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=zucfpi2splg1hbdky53rtabf' \
--data '{
    "token": "4203ce36b6a94d8e80bb497b860384c0",
    "page": "PropMst", "fd":"01-Apr-2024","td":"31-Aug-2025"
}'


[ Attandanced - punch in]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/savePage' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa' \
--data '{
  "token": "51b35f3b6af242898bfc397607aad328",
  "page": "punhin",
  "data": "{\"ID\":\"51b35f3b6af242898bfc397607aad328\", \"EmployeeId\":\"51b35f3b6af242898bfc397607aad328\",\"InDate\":\"\",\"InImage\":\"\",\"InRemarks\":\"\",\"InLocation\":{\"lat\":\"\",\"long\":\"\"},\"CUID\":\"51b35f3b6af242898bfc397607aad328\"}"
}
'

[ Attandanced - punch out]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/savePage' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa; ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa' \
--data '{
  "token": "51b35f3b6af242898bfc397607aad328",
  "page": "punhout",
  "data": "{\"ID\":\"51b35f3b6af242898bfc397607aad328\", \"EmployeeId\":\"51b35f3b6af242898bfc397607aad328\",\"OutDate\":\"\",\"OutImage\":\"\",\"OutRemarks\":\"\",\"OutLocation\":{\"lat\":\"\",\"long\":\"\"},\"CUID\":\"51b35f3b6af242898bfc397607aad328\"}"
}
'

[ get Drop-down ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getDDL' \
--header 'Content-Type: application/json' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "dtlid":"1081",
     "where": "PropTypeName=~Gender~"
}'

[ get Ajax ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getAjax' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=scsvjmlmyltbdc0aial10axa; ASP.NET_SessionId=yuhpy41xwsqjq2olhay4i3c0' \
--data '{
     "token": "d78134973d9b4697a2b3d5b8b2e87510",
     "dtlid":"1072",
     "where":"Status=~A~",
     "search": "dadfdfdfdd"
 }'

[ save page ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/savePage' \
--header 'Content-Type: application/json' \
--data-raw '{
    "data": 
"{\"EMPID\":\"1\",\"EMPCode\":\"00001\",\"CardNo\":\"\",\"BranchID\":\"1\",\"DepartmentID\":\"2\",\"DesignationID\":\"1\",\"JoinDate\":\"1/1/2025 12:00:00 AM\",\"Title\":\"Mr\",\"FirstName\":\"Satishvvbnnnnhn\",\"MiddleName\":\"Kalpeshbhai\",\"LastName\":\"Prajapati\",\"BirthDate\":\"1/1/1980 12:00:00 AM\",\"Gender\":\"M\",\"Religion\":\"Hindu\",\"BloodGroup\":\"AB-\",\"MobileNo\":\"87410256394\",\"MobileNo2\":\"\",\"PhoneNo\":\"9905012345\",\"EmailID\":\"satishk@gmail.com\",\"EmailID2\":\"satish@gmail.com\",\"EmergencyContactNo\":\"0533123456\",\"WebSite\":\"https://dev.com\",\"Disabilities\":\"51\",\"DisabilitiesRemarks\":\"\",\"LinkedIn\":\"satish.linkedin\",\"Facebook\":\"satish80\",\"Twitter\":\"satish1980\",\"Instagram\":\"satish80\",\"GitHub\":\"satishgit80\",\"CurrentAddress\":\"Bodak-dev, Near AMTS Stand, Ahmedabad\",\"CurrentCityID\":\"48428\",\"CurrentDistrict\":\"AHMEDABAD\",\"CurrentState\":\"GUJARAT\",\"CurrentCountry\":\"INDIA\",\"CurrentPin\":\"380054\",\"Address\":\"Bodak-dev, Near AMTS Stand, Ahmedabad\",\"CityID\":\"48428\",\"District\":\"AHMEDABAD\",\"State\":\"GUJARAT\",\"Country\":\"INDIA\",\"Pin\":\"380054\",\"AdharNo\":\"854172653987\",\"PANNo\":\"HGTUG5417H\",\"BankName\":\"HDFC Bank\",\"ACNo\":\"87456125367\",\"IFSCCode\":\"HDFC102310\",\"NameInBankAccount\":\"SATISH KALPESHBHAI PRAJAPATI\",\"PFNo\":\"PFSATISH\",\"ESINo\":\"ESICSATISH\",\"GratutityFormNo\":\"GT123456\",\"Status\":\"A\",\"ResignDate\":\"\",\"ResignReason\":\"\",\"Remarks\":\"\",\"LastDate\":\"\",\"UserID\":\"0\",\"CUID\":\"1\",\"Image\":\"d_logo.png\",\"CDT\":\"1/18/2025 12:00:00 AM\",\"MUID\":\"6\",\"MDT\":\"27-Aug-2025 13:22:37\"}",
 "page": "EmployeeMaster",
"token": "8c4aaf0e74fd4338943162b3876b2c7d"
}'


[ Delete ] 

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageDelete' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remark":"1=1",
     "page": "EmployeeMaster"
}'

[ Auth ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageAuth' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'


[ DeAuth ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageDeAuth' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'


[ Cancel ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/pageCancel' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=1tczjeqjqrgqtwjnq22yovtd' \
--data '{
     "token": "8c4aaf0e74fd4338943162b3876b2c7d",
     "id":"00100",
     "remarks":"1=1",
     "page": "EmployeeMaster"
}'

[ getLastPunchIn ] 

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/getLastPunchIn' \
--header 'Content-Type: application/json' \
--data '{
    "token": "49d45d99eff64492b94f449238507c7c"
}'

[ syncLocation ]

curl --location 'https://payroll.deverp.net/devws/msp_api.aspx/syncLocation' \
--header 'Content-Type: application/json' \
--header 'Cookie: ASP.NET_SessionId=ibj4tkc5ffzqbyp2xoni4pvt; ASP.NET_SessionId=2vj4yympr4l0kqag3xaxdcul' \
--data '{
    "token":"9eecfb8d7bbf4acba7568f21f078c9f5",
    "location":"45.5556,12.6655"
}'

================================================================================

1) Prerequisites (local)

Java JDK installed (openJDK 11+ recommended), Android SDK + platform tools, Android Studio or at least the Android build tools on PATH.

React Native CLI app (you said you already made a dummy app and not using Expo).

A Google account you’ll use to register as a Play developer.

(If you need help installing Android SDK / JDK I can paste commands — say the OS.)

2) Create a Google Play Developer account (one-time)

Sign up at the Play Console and pay the one-time registration fee (US$25 approx). You’ll also provide developer name and contact info. 
Google Support

Link: use Play Console signup when ready (Play Console help / Get started).

3) Prepare your app for release (source changes)

Bump versionName & versionCode in android/app/build.gradle (defaultConfig):

defaultConfig {
  applicationId "com.yourcompany.yourapp" // must be unique
  minSdkVersion rootProject.ext.minSdkVersion
  targetSdkVersion rootProject.ext.targetSdkVersion
  versionCode 1        // increment this for every upload
  versionName "1.0.0"  // visible to users
}


Always increment versionCode for every new upload. 
Android Developers

Unique applicationId / package name — Play requires each app’s package name be unique (you set this when you created the project). If you ever change it after publishing you’ll create a new app on Play.

Remove debug-only code/configs (dev servers, debug flags) and verify app works in release mode on device/emulator.

4) Create an upload key (keystore) — you control this

You need a keystore (upload key). Keep it and its passwords SAFE and back them up (Play cannot restore lost keystores easily).

Command (run in terminal):

# example — change alias/keystore name and passwords to your own values
keytool -genkey -v -keystore my-upload-key.jks -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000


This will prompt for passwords and metadata. (Works on macOS / Linux / Windows with Java's keytool available.) 
React Native

Then move the generated my-upload-key.jks into your RN project android/app/ folder (or keep it safe elsewhere — but Gradle config below expects to find or reference it).

5) Configure Gradle so release builds are signed by your upload key

React Native docs recommend storing keystore properties in ~/.gradle/gradle.properties (or android/gradle.properties) and referencing them from android/app/build.gradle.

A. Add these to ~/.gradle/gradle.properties (or android/gradle.properties):

MYAPP_UPLOAD_STORE_FILE=my-upload-key.jks
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password_here

B. Add signing config to android/app/build.gradle (example snippet inside android { ... }):

signingConfigs {
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
buildTypes {
    release {
        // Make sure you keep minify / proguard settings as desired
        signingConfig signingConfigs.release
        // minifyEnabled true/false depending on your needs
    }
}

This is the standard RN/Android way to point Gradle at your keystore. React Native docs explain this flow in detail. 
React Native

Important: for security, don’t check your *.jks or passwords into Git — add them to .gitignore and use secure storage/CI secrets.

6) Enroll in Play App Signing (Google Play signing)

For new apps, Play App Signing is mandatory: you upload an upload key (the one you created above) and Google will manage final app signing and distribution keys. Enroll when you create the app or during upload. 
Android Developers
Google Support

(Short version: you keep your upload key safe and upload the AAB signed with that upload key; Google manages the final signing key and distribution.)

7) Build the Android App Bundle (.aab)

Google Play requires/upload prefers AAB (Android App Bundle). From your RN project root:

# macOS / Linux
cd android
./gradlew bundleRelease

# Windows
cd android
gradlew.bat bundleRelease


When the build succeeds the AAB will be at:
android/app/build/outputs/bundle/release/app-release.aab — ready to upload to Play. 
React Native

8) Test the release build

Options:

Use Internal testing or Internal app sharing in Play Console (fastest way to get an installable link to testers). This avoids needing to produce APKs locally — upload the .aab to the internal track and invite testers. 
Google Play
Google Support

(Advanced) Use bundletool to generate device-specific APKs from the AAB and sideload — but internal testing is easier.

9) Create the app in Play Console & upload the AAB

Open Play Console → Create app → choose app name, language, app vs game, paid/free. (You picked up the dev account in step 2.) 
Google Support

Fill App Content (Policy) — privacy policy URL, data safety, target audience, content rating, ads declaration. These must be completed before publishing. 
Google Support
+1

Go to Release > Testing > Internal testing (or select Closed/Open testing or Production) → Create new release → upload the app-release.aab.

Review, save, and Start rollout to the chosen testing track.

Important: For the first upload you’ll be asked to accept Play App Signing if you haven’t already (see step 6). 
Android Developers

10) Store listing assets (required and common requirements)

Prepare and upload the following on the Play Console’s Store Listing page:

App icon (512×512 PNG, max 1MB).

Feature graphic (optional but recommended for promo).

Screenshots: at least 2 phone screenshots (JPEG or 24-bit PNG, no alpha). Google has specific rules: min dimension ~320 px, max 3840 px, aspect ratio constraints, and no extra device frames/text overlays in screenshots. See Play assets guidelines. 
Google Support
sommo.io

Upload clear screenshots that show actual app UI; prepare privacy policy URL and contact email.

11) Publish: internal → closed → production

Start with Internal testing to verify installs on real devices quickly. Once testers confirm, promote to Closed or Open testing, then to Production. Internal tests typically publish fast; production can take longer (hours → few days depending on review). 
Google Play
Google Support

12) After upload: checks & monitoring

Monitor Play Console for pre-launch reports, crash reports, ANRs, and policy issues.

If you push an update later, increment versionCode and build a new AAB (see step 3/7). 
Android Developers

13) Useful commands & troubleshooting tips

Generate keystore (again):

keytool -genkey -v -keystore my-upload-key.jks -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000


(Store the .jks and passwords safely.) 
React Native

Build AAB:

cd android
./gradlew bundleRelease


Output: android/app/build/outputs/bundle/release/app-release.aab. 
React Native

Check signing fingerprint (SHA-1):

keytool -list -v -keystore my-upload-key.jks -alias my-key-alias


(Needed for some APIs like Google Sign-In.) 
Google for Developers

Common errors

validateSigningRelease FAILED → signing config issue; check keystore path/password/alias and that Gradle properties are correct.

versionCode conflict → increase versionCode.

14) Quick publish checklist (before pressing Release)

 Google Play Developer account active (paid + verified). 
Google Support

 App bundle .aab built and signed with your upload key. 
React Native

 VersionCode incremented. 
Android Developers

 Store listing: title, short description, full description. 
Google Support

 Graphics: 512×512 icon, screenshots (2+), feature graphic if used. 
Google Support

 App content filled: privacy policy URL, data safety, content rating, target audience. 
Google Support
+1

 Enrolled in Play App Signing (new apps). 
Android Developers

Official references (open these while you publish)

React Native — Signed release / Publish to Play (how to create keystore, set gradle variables, build .aab). 
React Native

Android Developers — Upload your app to Play Console (Play App Signing is mandatory for new apps). 
Android Developers

Play Console — Get started with Play Console (developer account & fee). 
Google Support

Google Play — Play App Signing (upload vs app signing keys explanation). 
Google Support

Play Console — Add preview assets / screenshots requirements. 
Google Support

=


================================================
FILE: api_des.md
================================================
📱 Payroll Mobile App – API Documentation

This API enables authentication, menu fetching, attendance (punch-in/out), and CRUD operations for employee and payroll-related modules.

🔑 Step 1. Get Link

Retrieve the target app link from the central service.

Endpoint:

POST https://support.deverp.net/devws/appcode.aspx/getLink


Headers:

Content-Type: application/json


Request Body:

{
  "code": "payroll"
}


Response Example:

{
  "status": "success",
  "link": "https://payroll.deverp.net"
}

👤 Step 2. Set App ID

Authenticate the user and register the device.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/setAppID


Headers:

Content-Type: application/json


Request Body:

{
  "user": "suresh",
  "pass": "suresh",
  "appid": "appid",
  "firebaseid": "firebaseid",
  "device": "device"
}


Response Example:

{
  "status": "success",
  "appid": "generated_app_id",
  "session": "ASP.NET_SessionId=..."
}

🔐 Step 3. Get Auth Token

Obtain a session token for further API access.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getAuth


Headers:

Content-Type: application/json


Request Body:

{
  "appid": "your_appid",
  "device": "your_device"
}


Response Example:

{
  "token": "54da6bd990954c45a729d29210d23114"
}

📋 Step 4. Get Menu

Retrieve available menus for the user.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getMenu


Request Body:

{
  "token": "your_token"
}

🗄 Step 5. Get Database Info

Fetch DB-related details for user.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getDB


Request Body:

{
  "token": "your_token"
}

📑 Step 6. Get Page

Get metadata/schema for a specific page/module.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getPage


Request Body:

{
  "token": "your_token",
  "page": "PropMst"
}

📊 Step 7. Get List Data

Fetch list records between date ranges.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getListData


Request Body:

{
  "token": "your_token",
  "page": "PropMst",
  "fd": "01-Apr-2024",
  "td": "31-Aug-2025"
}

🕒 Attendance – Punch In

Record employee punch-in.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/punhin


Request Body:

{
  "token": "your_token",
  "page": "punhin",
  "data": "{\"EmployeeId\":\"EMP123\",\"InDate\":\"2025-08-28 09:00:00\",\"InImage\":\"base64img\",\"InRemarks\":\"Office entry\",\"InLocation\":{\"lat\":\"23.0225\",\"long\":\"72.5714\"},\"CUID\":\"your_token\"}"
}

🕔 Attendance – Punch Out

Record employee punch-out.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/punhout


Request Body:

{
  "token": "your_token",
  "page": "punhout",
  "data": "{\"EmployeeId\":\"EMP123\",\"OutDate\":\"2025-08-28 18:00:00\",\"OutImage\":\"base64img\",\"OutRemarks\":\"Leaving office\",\"OutLocation\":{\"lat\":\"23.0225\",\"long\":\"72.5714\"},\"CUID\":\"your_token\"}"
}

⬇️ Get Dropdown Data

Fetch dropdown values for forms.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getDDL


Request Body:

{
  "token": "your_token",
  "dtlid": "1081",
  "where": "PropTypeName=~Gender~"
}

🔍 Get Ajax Data

Fetch dynamic lookup/search data.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/getAjax


Request Body:

{
  "token": "your_token",
  "dtlid": "1103",
  "where": "1=1",
  "search": ""
}

💾 Save Page

Save or update employee data.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/savePage


Request Body:

{
  "page": "EmployeeMaster",
  "token": "your_token",
  "data": "{...employee json data...}"
}

🗑 Delete Page Record

Delete a record from a page.

Endpoint:

POST https://payroll.deverp.net/devws/msp_api.aspx/pageDelete


Request Body:

{
  "token": "your_token",
  "id": "00100",
  "remark": "Deleted by admin",
  "page": "EmployeeMaster"
}

✅ Page Authorization

Approve (authorize) a record.

POST /pageAuth


Request Body:

{
  "token": "your_token",
  "id": "00100",
  "remarks": "Approved",
  "page": "EmployeeMaster"
}

❌ Page De-Authorization

Revoke approval.

POST /pageDeAuth

🚫 Page Cancel

Cancel a record.

POST /pageCancel

🔄 API Flow Summary

getLink → fetch app URL

setAppID → authenticate user & device

getAuth → generate session token

getMenu / getDB → fetch menu & DB info

getPage / getListData → load module & records

punhin / punhout → attendance marking

getDDL / getAjax → dropdown & lookup data

savePage / pageDelete / pageAuth / pageDeAuth / pageCancel → CRUD & workflow

------ date ka diff har baar checkk kro - na ki nuumber of day ------


--- WORKING ON DARK THEME 
--- Manully ajax - input wala 
