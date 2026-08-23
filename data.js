// ============================================================
//  بيانات لعبة "شعندك؟"
//  كل فئة فرعية فيها قائمة عناصر، وكل عنصر له رابط صورة
//  يُشفَّر داخل الباركود (QR) حتى يفتحه الفريق على تلفونه.
//  الروابط المباشرة من ويكيميديا (متحقق منها)، وإذا ما توفر
//  رابط مباشر نستخدم بحث صور قوقل كبديل مضمون.
// ============================================================

// بحث صور قوقل — بديل مضمون يشتغل دائماً على أي تلفون
function gimg(query) {
  return "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(query);
}

var WIKI = "https://upload.wikimedia.org/wikipedia/";

// الفئات الرئيسية الست (أربع مخطط لها + اثنتان لاحقاً)
var MAIN_CATEGORIES = [
  { id: "guess",  name: "خمن الصورة",  img: "assets/categories/guess.png",  playable: true  },
  { id: "qa",     name: "سؤال و جواب", img: "assets/categories/qa.png",     playable: false },
  { id: "noword", name: "ولا كلمة",    img: "assets/categories/noword.png", playable: false },
  { id: "honest", name: "خلك صريح",   img: "assets/categories/honest.png", playable: false },
  { id: "mystery1", name: "؟؟؟", img: "", playable: false, mystery: true },
  { id: "mystery2", name: "؟؟؟", img: "", playable: false, mystery: true }
];

// الفئات الفرعية داخل "خمن الصورة"
var SUB_CATEGORIES = [
  {
    id: "cars", name: "سيارات", img: "assets/sub/cars.png",
    items: [
      { name: "شفروليه تاهو",        url: WIKI + "commons/thumb/2/22/2022_Chevrolet_Tahoe_RST%2C_front_3.7.22.jpg/960px-2022_Chevrolet_Tahoe_RST%2C_front_3.7.22.jpg" },
      { name: "فورد موستنج",         url: WIKI + "commons/thumb/9/9c/Ford_Mustang_VII_GT_Rutesheimer_Autoschau_2025_DSC_9234.jpg/960px-Ford_Mustang_VII_GT_Rutesheimer_Autoschau_2025_DSC_9234.jpg" },
      { name: "تويوتا سوبرا",        url: WIKI + "commons/thumb/e/e5/2020_Toyota_GR_Supra_%28United_States%29.png/960px-2020_Toyota_GR_Supra_%28United_States%29.png" },
      { name: "تويوتا تاكوما",       url: WIKI + "commons/thumb/5/5d/Toyota_Tacoma_%28N300%29_TRD_1X7A2438.jpg/960px-Toyota_Tacoma_%28N300%29_TRD_1X7A2438.jpg" },
      { name: "نيسان سكايلاين",      url: WIKI + "commons/thumb/0/06/Nissan_Skyline_GT-R_R34_V_Spec_II.jpg/960px-Nissan_Skyline_GT-R_R34_V_Spec_II.jpg" },
      { name: "ميني كوبر",           url: WIKI + "commons/thumb/e/e0/Mini_One_%28R50%29_%E2%80%93_Frontansicht%2C_12._Juni_2011%2C_D%C3%BCsseldorf.jpg/960px-Mini_One_%28R50%29_%E2%80%93_Frontansicht%2C_12._Juni_2011%2C_D%C3%BCsseldorf.jpg" },
      { name: "هوندا أكورد",         url: WIKI + "commons/thumb/2/26/2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg/960px-2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg" },
      { name: "كورفيت C8",           url: WIKI + "commons/thumb/4/4b/Chevrolet_Corvette_C8_IAA_2021_1X7A0156.jpg/960px-Chevrolet_Corvette_C8_IAA_2021_1X7A0156.jpg" },
      { name: "دودج تشالنجر",        url: WIKI + "commons/thumb/d/d3/Dodge_Challenger_SRT8_%282015%29_Hirschaid-20220709-RM-120221_%28cropped%29.jpg/960px-Dodge_Challenger_SRT8_%282015%29_Hirschaid-20220709-RM-120221_%28cropped%29.jpg" },
      { name: "لامبورجيني هوراكان",  url: WIKI + "commons/thumb/c/ca/2017_Lamborghini_Huracan_LP610.jpg/960px-2017_Lamborghini_Huracan_LP610.jpg" },
      { name: "تويوتا لاندكروزر",    url: WIKI + "commons/thumb/6/6d/2021_Toyota_Land_Cruiser_300_3.4_ZX_%28Colombia%29_front_view_04.png/960px-2021_Toyota_Land_Cruiser_300_3.4_ZX_%28Colombia%29_front_view_04.png" },
      { name: "نيسان باترول",        url: WIKI + "commons/thumb/9/9d/2016_Nissan_Patrol_%28Y62%29_Ti-L_wagon_%282018-09-17%29_01.jpg/960px-2016_Nissan_Patrol_%28Y62%29_Ti-L_wagon_%282018-09-17%29_01.jpg" }
    ]
  },
  {
    id: "ktech", name: "كلية الكويت التقنية", img: "assets/sub/ktech.png",
    items: [
      { name: "مبنى الكلية",      url: WIKI + "en/thumb/8/88/KtechCampusBuilding.png/500px-KtechCampusBuilding.png" },
      { name: "شعار الكلية",      url: WIKI + "commons/7/7c/Newktechlogo1.png" },
      { name: "مختبر الحاسوب",    url: WIKI + "commons/thumb/a/a5/Contemporary_Computer_Lab.jpg/500px-Contemporary_Computer_Lab.jpg" },
      { name: "المكتبة",          url: WIKI + "commons/thumb/4/4b/Long_Room_Interior%2C_Trinity_College_Dublin%2C_Ireland_-_Diliff.jpg/500px-Long_Room_Interior%2C_Trinity_College_Dublin%2C_Ireland_-_Diliff.jpg" },
      { name: "الكافتيريا",       url: WIKI + "commons/thumb/f/f2/Infosys.Electronic.City.Cafeteria.JPG/500px-Infosys.Electronic.City.Cafeteria.JPG" },
      { name: "قاعة المحاضرات",   url: WIKI + "commons/thumb/1/16/5th_Floor_Lecture_Hall.jpg/500px-5th_Floor_Lecture_Hall.jpg" },
      { name: "التسجيل",          url: WIKI + "commons/thumb/2/22/Sias_New_Student_Registration_2007.jpg/500px-Sias_New_Student_Registration_2007.jpg" },
      { name: "التخرج",           url: WIKI + "commons/thumb/2/26/Line_of_young_people_at_a_commencement_ceremony.jpg/500px-Line_of_young_people_at_a_commencement_ceremony.jpg" }
    ]
  },
  {
    id: "products", name: "منتجات", img: "assets/sub/products.png",
    items: [
      { name: "حليب KDD",          url: gimg("KDD milk") },
      { name: "عصير KDD برتقال",   url: gimg("KDD orange juice") },
      { name: "ماء الروضتين",      url: WIKI + "commons/thumb/1/17/RAWDATAIN_WATER.jpg/960px-RAWDATAIN_WATER.jpg" },
      { name: "شيبس عمان",         url: gimg("Oman chips") },
      { name: "بيبسي",             url: WIKI + "commons/a/a2/Pepsi_can_90s.jpg" },
      { name: "نوتيلا",            url: WIKI + "commons/9/9b/Nutella_ak.jpg" },
      { name: "تانج",              url: WIKI + "commons/thumb/f/fe/Drinking_Tang_by_the_gallon.jpg/960px-Drinking_Tang_by_the_gallon.jpg" },
      { name: "فيمتو",             url: WIKI + "commons/b/bd/Vimto.jpg" },
      { name: "جبنة كيري",         url: WIKI + "commons/thumb/3/37/Unpacking_a_KIRI_piece_of_cheese%2C_Japan.jpg/960px-Unpacking_a_KIRI_piece_of_cheese%2C_Japan.jpg" },
      { name: "ماجي مكعبات",       url: WIKI + "commons/thumb/9/9e/Household_products%2C_Maggi_Br%C3%BChw%C3%BCrfel.JPG/960px-Household_products%2C_Maggi_Br%C3%BChw%C3%BCrfel.JPG" },
      { name: "كتشب هاينز",        url: WIKI + "commons/thumb/d/d3/Heinz_Tomato_Ketchup%2C_Canada_%28front%29%2C_2026-02-19.jpg/960px-Heinz_Tomato_Ketchup%2C_Canada_%28front%29%2C_2026-02-19.jpg" },
      { name: "اندومي",            url: WIKI + "commons/2/2b/Indomie_%28box%29.jpg" }
    ]
  },
  {
    id: "countries", name: "دول العالم", img: "assets/sub/countries.png",
    items: [
      { name: "الكويت",     url: WIKI + "en/thumb/8/8c/Kuwait_Towers_RB.jpg/960px-Kuwait_Towers_RB.jpg" },
      { name: "السعودية",   url: WIKI + "commons/thumb/b/b2/Kingdom_Centre_Riyadh_2024.jpeg/960px-Kingdom_Centre_Riyadh_2024.jpeg" },
      { name: "اليابان",    url: WIKI + "commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/960px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg" },
      { name: "البرازيل",   url: WIKI + "commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/960px-Christ_the_Redeemer_-_Cristo_Redentor.jpg" },
      { name: "فرنسا",      url: WIKI + "commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/960px-Tour_Eiffel_Wikimedia_Commons.jpg" },
      { name: "ألمانيا",    url: WIKI + "commons/thumb/a/a6/Brandenburger_Tor_abends.jpg/960px-Brandenburger_Tor_abends.jpg" },
      { name: "مصر",        url: WIKI + "commons/thumb/9/96/Pyramids_of_the_Giza_Necropolis.jpg/960px-Pyramids_of_the_Giza_Necropolis.jpg" },
      { name: "الهند",      url: WIKI + "commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/960px-Taj_Mahal_%28Edited%29.jpeg" },
      { name: "أمريكا",     url: WIKI + "commons/thumb/8/89/Front_view_of_Statue_of_Liberty_%28cropped%29.jpg/960px-Front_view_of_Statue_of_Liberty_%28cropped%29.jpg" },
      { name: "بريطانيا",   url: WIKI + "commons/thumb/0/05/Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster%2C_London.jpg/960px-Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster%2C_London.jpg" },
      { name: "إيطاليا",    url: WIKI + "commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg" },
      { name: "تركيا",      url: WIKI + "commons/thumb/4/4a/Hagia_Sophia_%28228968325%29.jpeg/960px-Hagia_Sophia_%28228968325%29.jpeg" }
    ]
  },
  {
    id: "fishing", name: "حداق", img: "assets/sub/fishing.png",
    items: [
      { name: "زبيدي",   url: WIKI + "commons/6/66/Pampus_argenteus_1.jpg" },
      { name: "هامور",   url: WIKI + "commons/6/61/Epinephelus_coioides_Thailand.jpg" },
      { name: "شعري",    url: WIKI + "commons/thumb/d/d7/Lethrinus_nebulosus_287497294_%28cropped%29.jpg/960px-Lethrinus_nebulosus_287497294_%28cropped%29.jpg" },
      { name: "سبيطي",   url: WIKI + "commons/c/c4/Sparidentex_hasta.png" },
      { name: "صافي",    url: WIKI + "commons/d/d9/Siganus_canaliculatus%2C_Kampuan.jpg" },
      { name: "ميد",     url: WIKI + "commons/thumb/d/dc/M%C3%BAjol_%28Mugil_cephalus%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2021-09-09%2C_DD_25.jpg/960px-M%C3%BAjol_%28Mugil_cephalus%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2021-09-09%2C_DD_25.jpg" },
      { name: "نقرور",   url: WIKI + "commons/0/02/Pomadasys_commersonnii%2C_Breede_river_mouth.jpg" },
      { name: "چنعد",    url: WIKI + "commons/thumb/6/60/Narrow-barred_spanish_mackerel_%28Scomberomorus_commerson%29.jpg/960px-Narrow-barred_spanish_mackerel_%28Scomberomorus_commerson%29.jpg" },
      { name: "بالول",   url: WIKI + "commons/e/ef/Thunnus_tonggol.jpg" },
      { name: "قبقب",    url: WIKI + "commons/thumb/b/b2/Portunus_pelagicus_male.jpg/960px-Portunus_pelagicus_male.jpg" }
    ]
  },
  {
    id: "animals", name: "حيوانات", img: "assets/sub/animals.png",
    items: [
      { name: "أسد",     url: WIKI + "commons/thumb/a/a6/020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg/960px-020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg" },
      { name: "زرافة",   url: WIKI + "commons/thumb/9/9e/Giraffe_Mikumi_National_Park.jpg/960px-Giraffe_Mikumi_National_Park.jpg" },
      { name: "نمر",     url: WIKI + "commons/thumb/b/b0/Bengal_tiger_%28Panthera_tigris_tigris%29_female_3_crop.jpg/960px-Bengal_tiger_%28Panthera_tigris_tigris%29_female_3_crop.jpg" },
      { name: "صقر",     url: WIKI + "commons/thumb/d/df/Eurasian_hobby_%28Falco_subbuteo%29_by_Shantanu_Kuveskar.jpg/960px-Eurasian_hobby_%28Falco_subbuteo%29_by_Shantanu_Kuveskar.jpg" },
      { name: "جمل",     url: WIKI + "commons/thumb/4/43/07._Camel_Profile%2C_near_Silverton%2C_NSW%2C_07.07.2007.jpg/960px-07._Camel_Profile%2C_near_Silverton%2C_NSW%2C_07.07.2007.jpg" },
      { name: "ضب",      url: WIKI + "commons/thumb/c/cc/Uromastyx_aegyptia_2.jpg/960px-Uromastyx_aegyptia_2.jpg" },
      { name: "غزال",    url: WIKI + "commons/thumb/d/d6/Chinkara_-_Shreeram_M_V_-_Bikaner.jpg/960px-Chinkara_-_Shreeram_M_V_-_Bikaner.jpg" },
      { name: "بطريق",   url: WIKI + "commons/thumb/0/08/South_Shetland-2016-Deception_Island%E2%80%93Chinstrap_penguin_%28Pygoscelis_antarctica%29_04.jpg/960px-South_Shetland-2016-Deception_Island%E2%80%93Chinstrap_penguin_%28Pygoscelis_antarctica%29_04.jpg" },
      { name: "دلفين",   url: WIKI + "commons/thumb/1/10/Tursiops_truncatus_01.jpg/960px-Tursiops_truncatus_01.jpg" },
      { name: "فيل",     url: WIKI + "commons/thumb/3/37/African_Bush_Elephant.jpg/960px-African_Bush_Elephant.jpg" },
      { name: "بومة",    url: WIKI + "commons/thumb/5/56/Bubo_bubo_sibiricus_-_01.JPG/960px-Bubo_bubo_sibiricus_-_01.JPG" },
      { name: "حصان",    url: WIKI + "commons/thumb/d/de/Nokota_Horses_cropped.jpg/960px-Nokota_Horses_cropped.jpg" }
    ]
  },
  {
    id: "desert", name: "طعوس", img: "assets/sub/desert.png",
    items: [
      { name: "نيسان باترول VTC",  url: WIKI + "commons/thumb/9/9d/2016_Nissan_Patrol_%28Y62%29_Ti-L_wagon_%282018-09-17%29_01.jpg/960px-2016_Nissan_Patrol_%28Y62%29_Ti-L_wagon_%282018-09-17%29_01.jpg" },
      { name: "اف جي كروزر",       url: WIKI + "commons/thumb/a/af/2011_Toyota_FJ_Cruiser_%28GSJ15R%29_wagon_%282011-11-08%29_01.jpg/960px-2011_Toyota_FJ_Cruiser_%28GSJ15R%29_wagon_%282011-11-08%29_01.jpg" },
      { name: "جيب رانجلر",        url: WIKI + "commons/thumb/c/c2/Imperial_Sand_Dunes_%2851858339173%29.jpg/960px-Imperial_Sand_Dunes_%2851858339173%29.jpg" },
      { name: "دباب رباعي",        url: WIKI + "commons/thumb/0/08/Four_wheeler.jpg/960px-Four_wheeler.jpg" },
      { name: "بقي",               url: WIKI + "commons/thumb/7/75/1stMeyersManxWithBruceMeyers.jpg/960px-1stMeyersManxWithBruceMeyers.jpg" },
      { name: "خيمة بر",           url: WIKI + "commons/thumb/4/49/Bedouin_Tent%2C_Syrian_Desert_%285079932783%29.jpg/960px-Bedouin_Tent%2C_Syrian_Desert_%285079932783%29.jpg" },
      { name: "سيارة غارزة",       url: WIKI + "commons/0/07/Dune_bashing_in_Dubai.jpg" },
      { name: "جمل بالبر",         url: WIKI + "commons/thumb/c/c4/Camelus_dromedarius_in_Nuweiba.jpg/960px-Camelus_dromedarius_in_Nuweiba.jpg" },
      { name: "تطعيس",             url: WIKI + "commons/thumb/5/57/Dune_Bashing_Qatar.jpg/960px-Dune_Bashing_Qatar.jpg" }
    ]
  },
  {
    id: "celebs", name: "مشاهير", img: "assets/sub/celebs.png",
    items: [
      { name: "كريستيانو رونالدو",     url: WIKI + "commons/thumb/2/26/Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg/960px-Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg" },
      { name: "ليونيل ميسي",           url: WIKI + "commons/thumb/c/c8/Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg/960px-Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg" },
      { name: "محمد صلاح",             url: WIKI + "commons/thumb/a/a6/Mohamed_Salah_Argentina_v_Egypt_7_July_2026-163_%28cropped%29.jpg/960px-Mohamed_Salah_Argentina_v_Egypt_7_July_2026-163_%28cropped%29.jpg" },
      { name: "نيمار",                 url: WIKI + "commons/thumb/c/c0/Neymar_Junior_Brazil_V_Morocco_13_June_2026-40.jpg/960px-Neymar_Junior_Brazil_V_Morocco_13_June_2026-40.jpg" },
      { name: "ذا روك",                url: WIKI + "commons/thumb/7/7e/Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg/960px-Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg" },
      { name: "ويل سميث",              url: WIKI + "commons/thumb/5/55/TechCrunch_Disrupt_San_Francisco_2019_-_Day_1_%2848834070763%29_%28cropped%29.jpg/960px-TechCrunch_Disrupt_San_Francisco_2019_-_Day_1_%2848834070763%29_%28cropped%29.jpg" },
      { name: "عبدالحسين عبدالرضا",    url: WIKI + "commons/6/67/Abdulhussain_Abdulredha_2009_%28cropped%29_version.jpg" },
      { name: "طارق العلي",            url: WIKI + "commons/8/89/Tareq_Al-Ali.jpg" },
      { name: "داود حسين",             url: gimg("داود حسين ممثل") },
      { name: "سعد الفرج",             url: WIKI + "commons/1/16/Saad_Al-Faraj.jpg" }
    ]
  },
  {
    id: "movies", name: "أفلام", img: "assets/sub/movies.png",
    items: [
      { name: "تايتنك",           url: WIKI + "commons/thumb/6/6d/RMS_Titanic_3_%28cropped_to_ship%29.jpg/960px-RMS_Titanic_3_%28cropped_to_ship%29.jpg" },
      { name: "أفاتار",           url: WIKI + "commons/thumb/4/4b/Floating_Mountain_and_Goblin_Thistle_in_the_Valley_of_Mo%27ara_%2833546059874%29.jpg/960px-Floating_Mountain_and_Goblin_Thistle_in_the_Valley_of_Mo%27ara_%2833546059874%29.jpg" },
      { name: "هاري بوتر",        url: WIKI + "commons/thumb/b/b2/Hogwarts_-_Wizarding_World_of_Harry_Potter_-_Hollywood.jpg/960px-Hogwarts_-_Wizarding_World_of_Harry_Potter_-_Hollywood.jpg" },
      { name: "سبايدرمان",        url: WIKI + "commons/thumb/b/bf/Asia_Comic_Expo_2023_-_Spider-Man_cosplay_1.jpg/960px-Asia_Comic_Expo_2023_-_Spider-Man_cosplay_1.jpg" },
      { name: "باتمان",           url: WIKI + "commons/thumb/3/38/Batmobile_Tumbler.jpg/960px-Batmobile_Tumbler.jpg" },
      { name: "جوراسيك بارك",     url: WIKI + "commons/thumb/f/fa/Jurassic_Park_Entrance_Arch_at_the_Universal_Islands_of_Adventure.JPG/960px-Jurassic_Park_Entrance_Arch_at_the_Universal_Islands_of_Adventure.JPG" },
      { name: "فروزن",            url: WIKI + "commons/thumb/c/c7/Cosplay_of_Anna_and_Elsa_from_Frozen_at_Brussels_Comic_Con_2019_%2832364329607%29.jpg/960px-Cosplay_of_Anna_and_Elsa_from_Frozen_at_Brussels_Comic_Con_2019_%2832364329607%29.jpg" },
      { name: "توي ستوري",        url: WIKI + "commons/thumb/a/ae/Toy_Story_Land_sign_WDW.jpg/960px-Toy_Story_Land_sign_WDW.jpg" },
      { name: "فاست اند فيورس",   url: WIKI + "commons/thumb/4/4d/Fast_%26_Furious_Supercharged_%28Universal_Studios_Florida%29_1.jpg/960px-Fast_%26_Furious_Supercharged_%28Universal_Studios_Florida%29_1.jpg" },
      { name: "أفنجرز",           url: WIKI + "commons/thumb/4/43/Avengers_Campus_logo.svg/960px-Avengers_Campus_logo.svg.png" }
    ]
  }
];

// إعدادات عامة
var GAME_DEFAULTS = {
  winLimit: 1200,     // نقاط الفوز
  roundPoints: 100,   // نقاط الجولة الواحدة
  timerSeconds: 30    // مدة عدّاد الأسئلة
};
