/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL:"http://localhost:3000",
        DB_LOCAL_URI:"mongodb+srv://thienmenh2254_db_user:h7MB27bAaboBFpHj@cluster0.chkeo6f.mongodb.net/",
        DB_URI: "",
        NEXTAUTH_URL:"http://localhost:3000",
        NEXTAUTH_SECRET:"ABCD!@#",
        SMTP_HOST: "sandbox.smtp.mailtrap.io",
        SMTP_PORT: "2525",
        SMTP_USER: "0f58a54710b75d",
        SMTP_PASSWORD: "9c8920624c49a0",
        SMTP_FROM_EMAIL: "noreply@bookroom.com",
        SMTP_FROM_NAME: "BookRoom",
        CLOUDINARY_CLOUD_NAME:"dg4wd9ou5",
        CLOUDINARY_API_KEY:"675965753815741",
        CLOUDINARY_API_SECRET:"ydntNCaz8YyhJmXC9D_mn-1Obzg",
        GEOCODER_API_KEY:"rPVRoA1fyAsfqjqgi0GiHJYDJkl3YVle",
        GEOCODER_PROVIDER:"mapquest",
        MAPBOX_ACCESS_TOKEN:"pk.eyJ1Ijoid2x0bTA3IiwiYSI6ImNtbWVocWJuczA2MG8yc3F3Z2Y0MGhscmkifQ.eJaaN2wT04SjZ7ShJPpgFg",
    },
    images: {
        domains: ["res.cloudinary.com"],
    },

};

export default nextConfig;
