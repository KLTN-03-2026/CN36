import mongoose from "mongoose";
import Room from "../backend/models/room";
import User from "../backend/models/user";

const MONGO_URI = "mongodb+srv://thienmenh2254_db_user:h7MB27bAaboBFpHj@cluster0.chkeo6f.mongodb.net/";

const dummyNames = [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Minh Đức", 
    "Hoàng Thị Hoa", "Vũ Văn Hùng", "Đặng Thị Lan", "Bùi Minh Quân",
    "Lý Thị Mai", "Phan Văn Nam", "Ngô Thị Phương", "Dương Văn Quyết",
    "Trịnh Thị Thu", "Đỗ Văn Toàn", "Hồ Thị Yến", "Nguyễn Minh Khôi",
    "Trần Bảo Châu", "Lê Gia Hân", "Phạm Nhật Minh", "Hoàng Anh Thư"
];

const comments = [
    "Phòng rất sạch sẽ và thoáng mát. Nhân viên phục vụ tận tình.",
    "Vị trí tuyệt vời, gần trung tâm và các địa điểm ăn uống.",
    "Giá cả hợp lý, phòng đầy đủ tiện nghi.",
    "View từ phòng rất đẹp, tôi rất thích.",
    "Bữa sáng ngon miệng và đa dạng món.",
    "Không gian yên tĩnh, thích hợp để nghỉ dưỡng.",
    "Nội thất hiện đại, giường ngủ rất êm.",
    "Dịch vụ dọn phòng rất tốt, luôn sạch bóng.",
    "Chủ nhà rất thân thiện và hỗ trợ nhiệt tình.",
    "Mọi thứ đều hoàn hảo, chắc chắn sẽ quay lại.",
    "Phòng hơi nhỏ nhưng bù lại rất ấm cúng.",
    "Wifi mạnh, làm việc rất ổn định.",
    "Hồ bơi sạch và đẹp, các con tôi rất thích.",
    "Gần biển nên không khí rất trong lành.",
    "Thủ tục nhận phòng nhanh chóng, không phải đợi lâu.",
    "An ninh tốt, cảm thấy rất an toàn khi ở đây.",
    "Thiết kế phòng rất tinh tế và sang trọng.",
    "Phòng cách âm hơi kém một chút nhưng không sao.",
    "Địa điểm lý tưởng cho chuyến du lịch gia đình.",
    "Rất đáng đồng tiền bát gạo, highly recommend!"
];

const seedReviews = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        // 1. Create Dummy Users if they don't exist
        console.log("Creating dummy users...");
        let dummyUserIds = [];
        for (const name of dummyNames) {
            const email = name.toLowerCase().replace(/\s+/g, '') + "@example.com";
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    name,
                    email,
                    password: "password123", // Dummy password
                    avatar: {
                        public_id: "dummy_id",
                        url: "https://res.cloudinary.com/bookit/image/upload/v1619020989/bookit/avatars/default_avatar_jjt08b.jpg"
                    }
                });
            }
            dummyUserIds.push(user._id);
        }
        console.log(`${dummyUserIds.length} dummy users ready.`);

        // 2. Process Rooms
        const rooms = await Room.find();
        console.log(`Processing ${rooms.length} rooms...`);

        for (const room of rooms) {
            const reviewCount = Math.floor(Math.random() * 21) + 30; // 30 to 50
            const reviews = [];
            let totalRating = 0;

            for (let i = 0; i < reviewCount; i++) {
                const randomUserIndex = Math.floor(Math.random() * dummyUserIds.length);
                const randomRating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars
                const randomCommentIndex = Math.floor(Math.random() * comments.length);

                reviews.push({
                    user: dummyUserIds[randomUserIndex],
                    name: dummyNames[randomUserIndex],
                    rating: randomRating,
                    comment: comments[randomCommentIndex]
                });
                totalRating += randomRating;
            }

            await Room.updateOne(
                { _id: room._id },
                {
                    $set: {
                        reviews: reviews,
                        numOfReviews: reviewCount,
                        ratings: Number((totalRating / reviewCount).toFixed(1))
                    }
                }
            );
            console.log(`Added ${reviewCount} reviews to: ${room.name}`);
        }

        console.log("Seeding completed successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding reviews:", error);
        process.exit(1);
    }
};

seedReviews();
