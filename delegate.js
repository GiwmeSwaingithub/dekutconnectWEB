// Delegate data extracted from the PDF
        const delegates = [
            // CIVIL ENGINEERING
            { name: "KYALO CAREN NZISA", regNumber: "E024-01-1301/2023", gender: "FEMALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING",  photoUrl: "https://media-mba2-1.cdn.whatsapp.net/v/t61.24694-24/491843296_1540066364042857_1463355998010812813_n.jpg?ccb=11-4&oh=01_Q5Aa2wHYWoF0f_3CKDj5lt_eMXIH4pygKJ1CC_7JrNlH9prVNg&oe=690A877F&_nc_sid=5e03e0&_nc_cat=107"  },
            { name: "EMMANUEL MWENDWA KYALO", regNumber: "E024-01-1560/2025", gender: "MALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING" },
            { name: "SHADRACK ERUNGU", regNumber: "E024-01-1417/2024", gender: "MALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING" },
            { name: "MARTIN LUTHER MAINA", regNumber: "E024-01-2401/2022", gender: "MALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING" },
            { name: "MACHARIA PASCAL THONG'O", regNumber: "E024-01-1547/2025", gender: "MALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING" },
            { name: "GRACE WANGARI MURIUKI", regNumber: "E024-01-1561/2025", gender: "FEMALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING" },
            { name: "MIRIAM BONARERI OKONGO", regNumber: "E024-01-1572/2025", gender: "FEMALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING" },
            { name: "BAHATI SHITSUKANE", regNumber: "E024-01-1278/2023", gender: "MALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING" },
            { name: "ELIJAH MWANGANGI", regNumber: "E024-01-1377/2024", gender: "MALE", course: "BSC. CIVIL ENGINEERING", school: "CIVIL ENGINEERING" },
            
            // BUILDING CONSTRUCTION
            { name: "BRIAN KIPKOECH", regNumber: "7056-01-2270/2024", gender: "MALE", course: "BUILDING CONSTRUCTION", school: "CIVIL ENGINEERING" },
            { name: "BRIAN LENAPIR", regNumber: "7056-01-2481/2025", gender: "MALE", course: "BUILDING CONSTRUCTION", school: "CIVIL ENGINEERING" },
            { name: "ESTHER KWAMBOKA", regNumber: "7056-01-2489/2025", gender: "FEMALE", course: "BUILDING CONSTRUCTION", school: "CIVIL ENGINEERING" },
            
            // ELECTRICAL AND ELECTRONIC ENGINEERING
            { name: "CALEB VICTOR KIPKIRUI", regNumber: "E021-01-1041/2023", gender: "MALE", course: "BSC. EEE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "ERICK MACHARIA", regNumber: "E021-01-0971/2023", gender: "MALE", course: "BSC. EEE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "ADRIAN WAMALWA", regNumber: "E021-01-1276/2025", gender: "MALE", course: "BSC. EEE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING",photoUrl: "https://i.postimg.cc/3wDLv9Ss/Whats-App-Image-2025-10-26-at-11-22-05-AM-1.jpg" },
            { name: "ANN NJERI MWANGI", regNumber: "E021-01-1246/2025", gender: "FEMALE", course: "BSC. EEE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING",photoUrl: "https://i.postimg.cc/RZfcJRdb/Whats-App-Image-2025-10-26-at-2-20-27-PM.jpg" },
            { name: "KIPRUTO COLLINS", regNumber: "E021-01-1100/2024", gender: "MALE", course: "BSC. EEE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING",photoUrl: "https://i.postimg.cc/ydR3gY7Y/Whats-App-Image-2025-10-26-at-1-58-41-PM-2.jpg" },
            { name: "PRUDENCE WANJIRU MWANGI", regNumber: "E020-01-0933/2024", gender: "FEMALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING", photoUrl: "https://i.postimg.cc/qq8XLMWF/Whats-App-Image-2025-10-26-at-12-50-25-PM.jpg" },
            { name: "MARTIN MAUNDU", regNumber: "E021-01-2059/2023", gender: "MALE", course: "BSC. EEE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "BRIAN MURITHI KIMATHI", regNumber: "E020-01-0948/2024", gender: "MALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "JAMES MUGENDI", regNumber: "E020-01-2450/2025", gender: "MALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "LUTTAH BRAVIN", regNumber: "E020-01-1146/2022", gender: "MALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "MIKE CLINTON OTIENO", regNumber: "E020-01-1178/2025", gender: "MALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "DENNIS MWENDWA", regNumber: "E020-01-1119/2025", gender: "MALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "MWITA EVANS NYAISAWA", regNumber: "E020-01-2450/2022", gender: "MALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "LYNN JEMOTAI", regNumber: "1156/2025", gender: "FEMALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING",photoUrl: "https://i.postimg.cc/hj8R9KyV/Whats-App-Image-2025-10-26-at-11-22-10-AM.jpg" },
            { name: "ISAAC KIPLANGAT", regNumber: "E020-01-1129/2022", gender: "MALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING",photoUrl: "https://i.postimg.cc/4N92fpD0/Whats-App-Image-2025-10-26-at-1-58-42-PM-1.jpg" },
            { name: "CHRISTINE MUIA MUTUNGA", regNumber: "E021-01-2581/2024", gender: "FEMALE", course: "BSC. EEE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            { name: "AUSTIN MWANGI", regNumber: "E020-01-1115/2025", gender: "MALE", course: "TIE", school: "ELECTRICAL AND ELECTRONIC ENGINEERING" },
            
            // MECHATRONICS ENGINEERING
            { name: "SILAS VIRON", regNumber: "E022-01-1395/2025", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "VALENTINE JEPCHUMBA", regNumber: "E022-01-1205/2024", gender: "FEMALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING",photoUrl: "https://i.postimg.cc/VLQpb7Wv/Whats-App-Image-2025-10-26-at-1-58-43-PM.jpg" },
            { name: "KELVIN KIPKOECH", regNumber: "E022-01-1327/2025", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "EMMANUEL MWANZA", regNumber: "E022-01-1451/2021", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "REAGAN CHOMBA", regNumber: "E022-01-2202/2023", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING",photoUrl: "https://i.postimg.cc/qqcSCQRJ/Whats-App-Image-2025-10-26-at-11-22-04-AM.jpg" },
            { name: "COLLINS EMOJEL", regNumber: "E022-01-1180/2024", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "AMOS OMBONGI OGOCHI", regNumber: "E022-01-2749/2025", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "JOSEPH KARUKI KIMANI", regNumber: "E022-01-1333/2022", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "VICTORIA WAMBUI", regNumber: "E022-01-1148/2024", gender: "FEMALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "PAUL BOLO", regNumber: "E022-01-1218/2024", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "REGINALD BUKUTSA", regNumber: "E022-01-1385/2025", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" , photoUrl: "https://i.postimg.cc/TY9JLBT4/Whats-App-Image-2025-10-26-at-11-22-02-AM.jpg"},
            { name: "MUTHIGU EUTICAS MAINA", regNumber: "E022-01-1297/2025", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "DEBBIE GAKII", regNumber: "E022-01-1353/2025", gender: "FEMALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "BRADINO RUFUS", regNumber: "E022-01-2609/2025", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "YNNAH NYAMBURA", regNumber: "E022-01-2568/2025", gender: "FEMALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            { name: "MARK MUNENE SILA", regNumber: "E022-01-1343/2025", gender: "MALE", course: "BSC. MECHATRONICS ENGINEERING", school: "MECHATRONICS ENGINEERING" },
            
            // MECHANICAL ENGINEERING
            { name: "VICTOR KIPKOECH", regNumber: "E023-01-2125/2023", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING",photoUrl: "https://i.postimg.cc/y8NcJPYB/Whats-App-Image-2025-10-26-at-1-04-19-PM.jpg" },
            { name: "JOSEPH KAMUU KITHEKA", regNumber: "E023-01-1180/2023", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING",photoUrl: "https://i.postimg.cc/Kj5pYzqF/Whats-App-Image-2025-10-26-at-11-22-05-AM.jpg" },
            { name: "JACKTONE OKAKA", regNumber: "E023-01-1511/2021", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING" },
            { name: "VICTOR NZYAKA", regNumber: "E023-01-1496/2025", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING" },
            { name: "EDITH AMUTSAMA", regNumber: "E023-01-1196/2023", gender: "FEMALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING" },
            { name: "JUSTIN OKEMWA", regNumber: "E023-01-2643/2025", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING",photoUrl: "https://i.postimg.cc/cCQCtqwv/Whats-App-Image-2025-10-26-at-11-22-08-AM-2.jpg" },
            { name: "KIPTOO EDWIN", regNumber: "E023-01-1477/2025", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING",photoUrl: "https://i.postimg.cc/cJxr1MbB/Whats-App-Image-2025-10-26-at-3-00-14-PM.jpg" },
            { name: "MUTAHI JOSEPH", regNumber: "E023-01-1412/2025", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING", photoUrl: "https://i.postimg.cc/tT4YcvKV/Whats-App-Image-2025-10-26-at-11-22-08-AM.jpg" },
            { name: "PETER NDUNGU", regNumber: "E023-01-1235/2024", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING" },
            { name: "BRIAN IRERI", regNumber: "E023-01-1270/2024", gender: "MALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING",photoUrl: "https://i.postimg.cc/3RfkmMLD/Whats-App-Image-2025-10-26-at-12-40-10-PM.jpg" },
            { name: "JAEL MUENI", regNumber: "E023-01-1266/2024", gender: "FEMALE", course: "BSC. MECHANICAL ENGINEERING", school: "MECHANICAL ENGINEERING" },
            
            // PROCUREMENT AND LOGISTICS
            { name: "RIMAMOI TITUS PORIOT", regNumber: "B011-01-2668/2024", gender: "MALE", course: "BPSM", school: "PROCUREMENT AND LOGISTICS" },
            { name: "KANGETHE CHRIS MWAURA", regNumber: "B011-01-0670/2025", gender: "MALE", course: "BPSM", school: "PROCUREMENT AND LOGISTICS" },
            { name: "FAITH MUHONJA", regNumber: "B011-01-0694/2025", gender: "FEMALE", course: "BPSM", school: "PROCUREMENT AND LOGISTICS" },
            { name: "MARRIETA NDINDA", regNumber: "B011-01-0550/2023", gender: "FEMALE", course: "BPSM", school: "PROCUREMENT AND LOGISTICS" },
            { name: "SARUNI DANIEL", regNumber: "B011-01-0559/2023", gender: "MALE", course: "BPSM", school: "PROCUREMENT AND LOGISTICS" },
            { name: "LYDIA WANJIRU MUREITHI", regNumber: "B011-01-0671/2025", gender: "FEMALE", course: "BPSM", school: "PROCUREMENT AND LOGISTICS" },
            { name: "LUCY MUENI MWIKALI", regNumber: "B011-01-0677/2025", gender: "FEMALE", course: "BPSM", school: "PROCUREMENT AND LOGISTICS" },
            
            // BUSINESS ADMINISTRATION
            { name: "BRIAN KARANJA", regNumber: "B012-01-0555/2025", gender: "MALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "MARTIN KIVUVA MUNYIVA", regNumber: "B012-01-0578/2023", gender: "MALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "VIVIAN NJERI", regNumber: "B012-01-0761/2025", gender: "FEMALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "HEZRON DUKE", regNumber: "B012-01-0616/2024", gender: "MALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "ANTHONY MWENDWA", regNumber: "B012-01-0734/2025", gender: "MALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "VICTOR MARTIN", regNumber: "B012-01-0570/2024", gender: "MALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "WAYNE KARANJA KIMANI", regNumber: "B012-01-0724/2025", gender: "MALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "GATIBA ERICK MAINA", regNumber: "B012-01-0574/2023", gender: "MALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "MICHAEL MAWIRA KAVINDI", regNumber: "B012-01-0726/2025", gender: "MALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "PAULINE WANJIRU GITAU", regNumber: "B012-01-0553/2024", gender: "FEMALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            { name: "KAREN NJOKI", regNumber: "B012-01-0740/2025", gender: "FEMALE", course: "BACHELOR OF BUSINESS ADMINISTRATION", school: "BUSINESS ADMINISTRATION" },
            
            // BACHELOR OF ACCOUNTING AND FINANCE
            { name: "ANTONY KIOKO WAMBUA", regNumber: "B010-01-0439/2023", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "BETTY JOAN WANJIRU", regNumber: "B010-01-0449/2023", gender: "FEMALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE",photoUrl: "https://i.postimg.cc/BbbWRkcd/Whats-App-Image-2025-10-26-at-11-50-45-AM.jpg" },
            { name: "MAINA PEACE", regNumber: "B010-01-0517/2025", gender: "FEMALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "ELVIN OMONDI", regNumber: "B010-01-0658/2025", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "DIPORAH CHEBET", regNumber: "B010-01-0597/2025", gender: "FEMALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE",photoUrl: "https://i.postimg.cc/Sxm6B8kt/Whats-App-Image-2025-10-26-at-1-58-41-PM-1.jpg" },
            { name: "EVELINE MUTINDI", regNumber: "B010-01-0349/2024", gender: "FEMALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "CALEB KIPROB", regNumber: "B010-01-0437/2024", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "SHAPASHINA LEKATOO", regNumber: "B010-01-1893/2023", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "JANET MWONGELI MWEMA", regNumber: "B010-01-0610/2025", gender: "FEMALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "PETER NGUNDI MUTEMI", regNumber: "B010-01-0508/2025", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "NDERABA BRIAN", regNumber: "B010-01-0504/2023", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "ALALOQUE HARTY MITCHELLE", regNumber: "B010-01-0482/2024", gender: "FEMALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "CHRISTINE NDUTA", regNumber: "B010-01-0430/2025", gender: "FEMALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "ALLOYS MAKORI", regNumber: "B010-01-0452/2025", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "SIMON NGUGI GACHUIRI", regNumber: "B010-01-0343/2024", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "MUDAIDA GREY", regNumber: "B010-01-0635/2025", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "KAMOTHO VICKY", regNumber: "B010-01-0399/2024", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "ISMAIL MIKO PAUL", regNumber: "B010-01-0359/2024", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            { name: "ALEX MUREITH GIKUNDI", regNumber: "B010-01-2594/2024", gender: "MALE", course: "BACHELOR OF COMMERCE", school: "BACHELOR OF ACCOUNTING AND FINANCE" },
            
            // COMPUTER SCIENCE
            { name: "NGENO CHEROTICH CARREN", regNumber: "C026-01-2560/2025", gender: "FEMALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "GIPSON MUTUNGI NZIOKI", regNumber: "C026-01-0937/2025", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "KIPROTICH BRIAN KORIR", regNumber: "C026-01-0757/2023", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE",photoUrl: "https://i.postimg.cc/XJxSg9js/Whats-App-Image-2025-10-26-at-1-58-42-PM.jpg" },
            { name: "CHOMBA GITARI", regNumber: "C026-01-0726/2023", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "TABITHA WANJIRU IREGI", regNumber: "C026-01-0899/2025", gender: "FEMALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "CEDRIC OCHIENG ODERO", regNumber: "C026-01-0985/2025", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "SIMON KITHITO MWENDWA", regNumber: "C026-01-0920/2025", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "CALEB MURITHI", regNumber: "C026-01-0762/2023", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "BRIAN KARABA", regNumber: "C026-01-0732/2024", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "FRANKLINE MURIITHI KINYUA", regNumber: "C026-01-0730/2024", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "ZAWADI MARIA", regNumber: "C026-01-0889/2025", gender: "FEMALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            { name: "CHARLES ITATU MBUTU", regNumber: "C026-01-0777/2023", gender: "MALE", course: "BSC. COMPUTER SCIENCE", school: "COMPUTER SCIENCE" },
            
            // INFORMATION TECHNOLOGY
            { name: "ELIPHAS MUTHOMI", regNumber: "C025-01-0831/2025", gender: "MALE", course: "BSC. INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY",photoUrl: "https://i.postimg.cc/cJxr1MbB/Whats-App-Image-2025-10-26-at-3-00-14-PM.jpg" },
            { name: "SHARON MWENDE", regNumber: "C025-01-0839/2025", gender: "FEMALE", course: "BSC. INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            { name: "MERCY CHERONO", regNumber: "C025-01-2597/2024", gender: "FEMALE", course: "BSC. INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            { name: "HILLARY KOECH", regNumber: "C025-01-0848/2025", gender: "MALE", course: "BSC. INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            { name: "COLLINS KIPKOSKEI", regNumber: "C025-01-1363/2023", gender: "MALE", course: "BSC. INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            { name: "KINYUA BRIAN NJOROGE", regNumber: "C025-01-2691/2024", gender: "MALE", course: "BSC. INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            { name: "DANIEL MWANZIA", regNumber: "C025-01-0823/2025", gender: "MALE", course: "BSC. BUSINESS INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            { name: "LEVIS OUMA", regNumber: "C027-01-1070/2025", gender: "MALE", course: "BSC. BUSINESS INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY",photoUrl: "https://i.postimg.cc/kMcYBnGK/Whats-App-Image-2025-10-26-at-2-20-26-PM.jpg" },
            { name: "CARLOS KIPRUTO BIRECH", regNumber: "C027-01-2589/2025", gender: "MALE", course: "BSC. BUSINESS INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY",photoUrl: "https://i.postimg.cc/CKjDKsST/Whats-App-Image-2025-10-26-at-3-00-39-PM.jpg" },
            { name: "JOY GATHONI", regNumber: "C027-01-0789/2023", gender: "FEMALE", course: "BSC. BUSINESS INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            { name: "NZWU STEPHEN", regNumber: "C027-01-1027/2025", gender: "MALE", course: "BS. BUSINESS INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            { name: "HILLARY KIPTOO", regNumber: "C027-01-0900/20-2024", gender: "MALE", course: "BSC. BUSINESS INFORMATION TECHNOLOGY", school: "INFORMATION TECHNOLOGY" },
            
            // NURSING
            { name: "ABIGAEL LOINA", regNumber: "H151-01-2049/2025", gender: "FEMALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "ELKANA KIPROTICH LANGAT", regNumber: "H151-01-1906/2024", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "ALSEN KERUBO OSORO", regNumber: "H151-01-1931/2024", gender: "FEMALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "MESHACK MUUO MUASIYA", regNumber: "H151-01-2752/2024", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "JOHN MIKE MUTUIRI", regNumber: "H151-01-1880/2024", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "MELCHIZEDEK MUUO MAKAU", regNumber: "H151-01-2901/2025", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "JAEL ADHIAMBO OKETCH", regNumber: "H151-01-2545/2024", gender: "FEMALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "BILDAD OIGO OMWWENGA", regNumber: "H151-01-1754/2023", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "FMARK MUNENE KIMANI", regNumber: "H151-01-1801/2022", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "KELVIN KIPRONO CHERUIYOT", regNumber: "H151-01-1819/2022", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "SIELE FAITH CHEPNGENO", regNumber: "H151-01-2041/2025", gender: "FEMALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "NADUYA KIMOJINO", regNumber: "H151-01-2929/2025", gender: "FEMALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "NJERU K CHRIS KEN", regNumber: "H151-01-2004/2025", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "STACY WANGARI WAWERU", regNumber: "H151-01-2779/2025", gender: "FEMALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "CHACHA JAMES MARWA", regNumber: "H151-01-1928/2024", gender: "MALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "IVY WACHERA WAMBUGU", regNumber: "H151-01-2654/2024", gender: "FEMALE", course: "BSC. NURSING", school: "NURSING" },
            { name: "MMWENDA MILLICENT KARUGI", regNumber: "H151-01-2665/2024", gender: "FEMALE", course: "BSC. NURSING", school: "NURSING" },
            
            // STATISTICS AND ACTUARIAL SCIENCE
            { name: "PETER MWANGI", regNumber: "S030-01-2188/2025", gender: "MALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            { name: "MOREEN MWENDI", regNumber: "S030-01-2065/2024", gender: "MALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            { name: "SHADRACK KINGORI", regNumber: "S030-01-2087/2024", gender: "MALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            { name: "SANGURA FRANCIS", regNumber: "S030-01-2072/2024", gender: "MALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            { name: "PHANUEL NYAGRO", regNumber: "S030-01-1865/2023", gender: "MALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            { name: "YVONNE KADHAMBI", regNumber: "S030-01-2251/2025", gender: "MALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            { name: "KIRAGU EDNA", regNumber: "S030-01-2194/2025", gender: "FEMALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            { name: "ALLAN MUTUNGA", regNumber: "S030-01-2071/2024", gender: "MALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            { name: "SAMUEL MUSYMI KYALO", regNumber: "S030-01-2242/2025", gender: "MALE", course: "BSC. ACTURIAL SCIENCE", school: "STATISTICS AND ACTUARIAL SCIENCE" },
            
            // CHEMICAL ENGINEERING
            { name: "BRIAN KIPKEMEI", regNumber: "E034-01-1897/2025", gender: "MALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "MWENDWA ESTHER", regNumber: "E034-01-1749/2024", gender: "FEMALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "FAITH MAKENA", regNumber: "E034-01-1619/2023", gender: "FEMALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "AMBROSE ADONGO", regNumber: "E034-01-2027/2022", gender: "MALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "MERCY WATARE", regNumber: "E034-01-1881/2025", gender: "FEMALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "DEBRA MUSIMBI", regNumber: "E034-01-1713/2022", gender: "FEMALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "LAWRENCE NCHOKO", regNumber: "E034-01-1633/2023", gender: "MALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "EMMANUEL KASEGERE", regNumber: "E034-01-2140/2023", gender: "MALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "JOAB KANGETHE", regNumber: "E034-01-2624/2020", gender: "MALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "IAN BOSIRI", regNumber: "E034-01-1913/2025", gender: "MALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "ESTHER AKINYI", regNumber: "E034-01-1884/2025", gender: "FEMALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            { name: "JERRYL NYAKARA", regNumber: "E034-01-1776/2024", gender: "FEMALE", course: "BSC. CHEMICAL ENGINEERING", school: "CHEMICAL ENGINEERING" },
            
            // INSTITUTE OF GEOTHERMAL TRAINING AND RESEARCH
            { name: "OMITI SPENCER", regNumber: "G082-01-1981/2025", gender: "MALE", course: "BSC. GEOLOGY", school: "INSTITUTE OF GEOTHERMAL TRAINING AND RESEARCH" },
            { name: "ABEL MNANGAT", regNumber: "G082-01-1977/2025", gender: "MALE", course: "BSC. GEOLOGY", school: "INSTITUTE OF GEOTHERMAL TRAINING AND RESEARCH" },
            { name: "MARTIN NDUNGU", regNumber: "G082-01-1975/2025", gender: "MALE", course: "BSC. GEOLOGY", school: "INSTITUTE OF GEOTHERMAL TRAINING AND RESEARCH" },
            { name: "PETER SENO ZAKAYO", regNumber: "G082-01-1782/2022", gender: "MALE", course: "BSC. GEOLOGY", school: "INSTITUTE OF GEOTHERMAL TRAINING AND RESEARCH" },
            { name: "KIPRUTO NAHASION", regNumber: "G082-01-1861/2024", gender: "MALE", course: "BSC. GEOLOGY", school: "INSTITUTE OF GEOTHERMAL TRAINING AND RESEARCH" },
            
            // INSTITUTE OF TOURISM AND HOSPITALITY
            { name: "CALEB PORIOT", regNumber: "N001-01-2150/2025", gender: "MALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "OWEN MUCHOKI", regNumber: "N001-01-1950/2024", gender: "MALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "CYNTHIA NGULA", regNumber: "N001-01-0012/2025", gender: "FEMALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "PAUL CHACHA RIOBA", regNumber: "N001-01-2010/2024", gender: "MALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "ABIGAIL NYAMWATHI", regNumber: "N001-01-2107/2025", gender: "FEMALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "GEDION MUNTET", regNumber: "N001-01-1975/2024", gender: "MALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY",photoUrl: "https://i.postimg.cc/MpRxYkGp/Whats-App-Image-2025-10-26-at-1-07-54-PM.jpg" },
            { name: "SHELMITH WAIRIMU", regNumber: "N001-01-1767/2023", gender: "FEMALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY",photoUrl: "https://i.postimg.cc/fynTswkn/Whats-App-Image-2025-10-26-at-11-51-10-AM.jpg" },
            { name: "ASACHITA EDITH", regNumber: "N001-01-1980/2024", gender: "FEMALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY", photoUrl: "https://i.postimg.cc/XYvN4B2T/Whats-App-Image-2025-10-26-at-11-22-09-AM.jpg" },
            { name: "TERRYANNE ADHIAMBO", regNumber: "N001-01-0286/2025", gender: "FEMALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "LUCY BOERA", regNumber: "N001-01-1964/2023", gender: "FEMALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "ISUMBI HARON", regNumber: "N001-01-2132/2025", gender: "MALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "ROBERT NGANGA", regNumber: "N001-01-2164/2025", gender: "MALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            { name: "VIVIAN NKIROTE", regNumber: "N001-01-2604/2024", gender: "FEMALE", course: "BSC. TOURISM AND HOSPITALITY MANAGEMENT", school: "INSTITUTE OF TOURISM AND HOSPITALITY" },
            
            // INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING
            { name: "JAMES KNOTI KIMATHI", regNumber: "E032-01-1782/2025", gender: "MALE", course: "BSC.GIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "VALLERIE JEPKOSGEI KIPCHUMBA", regNumber: "E032-01-1543/2023", gender: "MALE", course: "BSC.GIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "ELKANA OLKIMPAI", regNumber: "E031-01-1593/2024", gender: "MALE", course: "BSC.GEGIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "EMILLIO ABABU NAMWAMBA", regNumber: "E032-01-1652/2024", gender: "MALE", course: "BSC.GIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "BRIAN KIPLANGAT", regNumber: "E031-01-1749/2025", gender: "MALE", course: "BSC.GEGIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "TIMOTHY MUTINDA", regNumber: "E031-01-1453/2023", gender: "MALE", course: "BSC.GEGIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "CALEB MUTUA", regNumber: "E032-01-1630/2024", gender: "MALE", course: "BSC.GIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING",photoUrl: "https://i.postimg.cc/Nfny4HLY/Whats-App-Image-2025-10-26-at-1-58-44-PM.jpg" },
            { name: "GODFREY MANYALA", regNumber: "E031-01-1481/2023", gender: "MALE", course: "BSC.GEGIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "JACKSON MUMO", regNumber: "E032-01-1508/2023", gender: "MALE", course: "BSC.GIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "HANNAH NYAMBURA", regNumber: "E031-01-2461/2024", gender: "FEMALE", course: "BSC.GEGIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "HOPE CHERONO", regNumber: "E032-01-1624/2024", gender: "FEMALE", course: "BSC.GIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING" },
            { name: "VINCENT KIPKOECH", regNumber: "E031-01-1580/2022", gender: "MALE", course: "BSC.GEGIS", school: "INSTITUTE OF GEOMATICS AND GIS REMOTE SENSING", photoUrl: "https://i.postimg.cc/Rhf61JrX/Whats-App-Image-2025-10-26-at-11-22-08-AM-1.jpg" },
            
            // CHEMISTRY
            { name: "SIMON KYALO", regNumber: "S080-01-2133/2024", gender: "MALE", course: "BSC.INDUSTRIAL CHEM", school: "CHEMISTRY" },
            { name: "KYALO FAITH MUENI", regNumber: "S080-01-1920/2023", gender: "FEMALE", course: "BSC.INDUSTRIAL CHEM", school: "CHEMISTRY" },
            { name: "VINCENT OMARI LEVI", regNumber: "S080-01-2328/2025", gender: "MALE", course: "BSC. INDUSTRIAL CHEM", school: "CHEMISTRY" },
            { name: "REAGAN MWANGI", regNumber: "S080-01-2310/2025", gender: "MALE", course: "BSC.INDUSTRIAL CHEM", school: "CHEMISTRY" },
            { name: "BRIAN KIPROTICH KEMBOI", regNumber: "S081-01-2337/2025", gender: "MALE", course: "BSC.LEATHER TECHNOLOGY", school: "CHEMISTRY" },
            { name: "ANABEL WANJIKU", regNumber: "S080-01-2325/2025", gender: "FEMALE", course: "BSC.INDUSTRIAL CHEM", school: "CHEMISTRY" },
            { name: "LUCAS VICTOR", regNumber: "S080-01-1903/2023", gender: "MALE", course: "BSC. INDUSTRIAL CHEMISTRY", school: "CHEMISTRY" },
            { name: "ENOCK CHERUIYOT", regNumber: "S080-01-2147/2024", gender: "MALE", course: "BSC.INDUSTRIAL CHEM", school: "CHEMISTRY",photoUrl: "https://i.postimg.cc/t4fg3QSR/Whats-App-Image-2025-10-26-at-1-58-41-PM-3.jpg" },
            { name: "JOHN KASAINE", regNumber: "T185-01-2217/2023", gender: "MALE", course: "DIPLOMA LEATHER TECH", school: "CHEMISTRY" },
            { name: "DIANA KAVINDU", regNumber: "T185-01-2949/2024", gender: "FEMALE", course: "DIPLOMA LEATHER TECH", school: "CHEMISTRY" },
            { name: "BABRA WEKESA", regNumber: "S080-01-2332/2025", gender: "FEMALE", course: "BSC.INDUSTRIAL CHEM", school: "CHEMISTRY" },
            
            // INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY
            { name: "EVELYN NJERI MWANGI", regNumber: "F061-01-1942/2025", gender: "FEMALE", course: "BSC.NUTRITION", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "JOSEPH KIARIE", regNumber: "F061-01-1820/2024", gender: "MALE", course: "BSC.NUTRITION", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "MOSES MUTEMWA", regNumber: "F061-01-1954/2025", gender: "MALE", course: "BSC.NUTRITION", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "BRIAN MASIBO", regNumber: "1968/2025", gender: "MALE", course: "BSC. NUTRITION", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "ABRAHAM ODIWUOR", regNumber: "1973/2025", gender: "MALE", course: "BSC.NUTRITION", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "EVANS TANUI", regNumber: "1736/2022", gender: "MALE", course: "BSC. FOOD SCIENCE", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "FAITH JEMUTAI", regNumber: "1731/2022", gender: "FEMALE", course: "BSC.FOOD SCIENCE", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "WINNIE WAGAKI", regNumber: "1941/2025", gender: "FEMALE", course: "BSC. NUTRITION", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "DAVID KARUKI", regNumber: "0483/2023", gender: "MALE", course: "BSC.FOOD SCIENCE", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            { name: "ALVIN META", regNumber: "1972/2025", gender: "MALE", course: "BSC. NUTRITION", school: "INSTITUTE OF FOOD BIORESOURCES TECHNOLOGY" },
            
            // INSTITUTE OF TECHNICAL AND PROFESSIONAL STUDIES
            { name: "FAITH WANGU", regNumber: "E122-01-2318/2023", gender: "FEMALE", course: "DIPLOMA EEE", school: "INSTITUTE OF TECHNICAL AND PROFESSIONAL STUDIES" },
            { name: "TIMOTHY MUCHUKU", regNumber: "E122-01-2740/2025", gender: "MALE", course: "DIPLOMA EEE", school: "INSTITUTE OF TECHNICAL AND PROFESSIONAL STUDIES" },
            { name: "DEBORAH MWONGELI", regNumber: "E122-01-2904/2024", gender: "FEMALE", course: "DIPLOMA EEE", school: "INSTITUTE OF TECHNICAL AND PROFESSIONAL STUDIES" },
            { name: "BONVENTURE NANDWA", regNumber: "E122-01-0303/2025", gender: "MALE", course: "DIPLOMA EEE", school: "INSTITUTE OF TECHNICAL AND PROFESSIONAL STUDIES" },
            { name: "MWENJI OPRAH", regNumber: "T182-01-2906/2024", gender: "FEMALE", course: "DIPLOMA FASHION", school: "INSTITUTE OF TECHNICAL AND PROFESSIONAL STUDIES" },
            { name: "ENOCK KIPTOO", regNumber: "E122-01-2790/2025", gender: "MALE", course: "DIPLOMA EEE", school: "INSTITUTE OF TECHNICAL AND PROFESSIONAL STUDIES" },
            { name: "GREGORY MUITHYA MWEMA", regNumber: "T181-01-2970/202", gender: "MALE", course: "DIPLOMA BTECH", school: "INSTITUTE OF TECHNICAL AND PROFESSIONAL STUDIES" },
            
            // TECHNOLOGY EDUCATION
            { name: "AUSTINE OUMA", regNumber: "E029-01-1546/2024", gender: "MALE", course: "BED.MECHANICAL", school: "TECHNOLOGY EDUCATION",photoUrl: "https://i.postimg.cc/C56DJpdb/Whats-App-Image-2025-10-26-at-11-22-07-AM-1.jpg" },
            { name: "CALEB KIPLANGAT", regNumber: "E029-01-2458/2024", gender: "MALE", course: "BED.MECHANICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "ELISHA KIPLANGAT KOECH", regNumber: "E028-01-1654/2025", gender: "MALE", course: "BED ELECTRICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "KEVIN KIPCHIRCHIR", regNumber: "E028-01-1484/2024", gender: "MALE", course: "BED ELECTRICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "KELVIN MACHARIA", regNumber: "E028-01-1456/2024", gender: "MALE", course: "BED ELECTRICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "GEDION KIPROTICH MUTAI", regNumber: "E029-01-1709/2025", gender: "MALE", course: "BED MECHNICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "CHARITY MAKOKHA", regNumber: "E033-01-1701/2024", gender: "FEMALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION",photoUrl: "https://i.postimg.cc/K8CfxBGG/Whats-App-Image-2025-10-26-at-11-22-07-AM.jpg" },
            { name: "REGINA ATIENO", regNumber: "E033-01-1859/2025", gender: "FEMALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION" },
            { name: "ANITA CHELANGAT", regNumber: "E033-01-1700/2024", gender: "FEMALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION", photoUrl: "https://i.postimg.cc/qRvTrPMC/Whats-App-Image-2025-10-26-at-11-22-03-AM.jpg" },
            { name: "KENNEDY MWEMA", regNumber: "E033-01-1691/2024", gender: "MALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION" },
            { name: "JOSEPH WAMBUA", regNumber: "E029-01-1703/2025", gender: "MALE", course: "BED MECHANICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "HILDA KINYA", regNumber: "E029-01-1524/2024", gender: "FEMALE", course: "BED MECHANICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "PERIS WANJIKU", regNumber: "E028-01-1663/2025", gender: "FEMALE", course: "BED ELECTRICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "ALEX GITONGA", regNumber: "E033-01-1817/2025", gender: "MALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION" },
            { name: "WYCLIFF OKELLO", regNumber: "E028-01-1500/2024", gender: "MALE", course: "BED ELECTRICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "SAMSON MACHINI", regNumber: "E029-01-1712/2025", gender: "MALE", course: "BED MECHANICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "JOYCE WANJIRU", regNumber: "E033-01-1699/2024", gender: "FEMALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION",photoUrl: "https://i.postimg.cc/76bq05Jz/Whats-App-Image-2025-10-26-at-11-53-40-AM.jpg" },
            { name: "YVONNE MAKENA", regNumber: "E033-01-0739/2025", gender: "FEMALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION" },
            { name: "MORGAN OLAGO", regNumber: "E033-01-1856/2025", gender: "MALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION",photoUrl: "https://i.postimg.cc/cH7rkg4D/Whats-App-Image-2025-10-26-at-1-05-01-PM.jpg" },
            { name: "ENOCK OMBASA", regNumber: "E029-01-1727/2025", gender: "MALE", course: "BED MECHANICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "BENTA AKEYO", regNumber: "E033-01-1867/2025", gender: "FEMALE", course: "BED CIVIL", school: "TECHNOLOGY EDUCATION" },
            { name: "EVELYNE KAVILE KINYILI", regNumber: "E028-01-1339/2023", gender: "FEMALE", course: "BED EEE", school: "TECHNOLOGY EDUCATION",photoUrl: "https://i.postimg.cc/Nfny4HLY/Whats-App-Image-2025-10-26-at-1-58-44-PM.jpg" },
            { name: "WASHINGTON OKETCH", regNumber: "E028-01-1379/2023", gender: "MALE", course: "BED ELECTRICAL", school: "TECHNOLOGY EDUCATION" },
            { name: "CELESTINE CHEROBON TUWEI", regNumber: "E028-01-1640/2025", gender: "FEMALE", course: "BED ELECTRICAL", school: "TECHNOLOGY EDUCATION" },
            
            // MATHEMATICAL AND PHYSICAL SCIENCE
            { name: "ODHIAMBO MALON", regNumber: "S084-01-2388/2025", gender: "MALE", course: "BSC. MATHEMATICS AND MODELLING", school: "MATHEMATICAL AND PHYSICAL SCIENCE" },
            { name: "LORINE CHEROTICH", regNumber: "S084-01-2224/2024", gender: "FEMALE", course: "BSC. MATHEMATICS AND MODELLING", school: "MATHEMATICAL AND PHYSICAL SCIENCE" },
            { name: "LEAH NDANO", regNumber: "S084-01-2214/2024", gender: "FEMALE", course: "BSC. MATHEMATICS AND MODELLING", school: "MATHEMATICAL AND PHYSICAL SCIENCE" },
            { name: "ANN BAKHITA", regNumber: "S084-01-2202/2024", gender: "FEMALE", course: "BSC. MATHEMATICS AND MODELLING", school: "MATHEMATICAL AND PHYSICAL SCIENCE" },
            { name: "DERRICK MANANI MOBISA", regNumber: "S084-01-2228/2024", gender: "MALE", course: "BSC. MATHEMATICS AND MODELLING", school: "MATHEMATICAL AND PHYSICAL SCIENCE" },
            { name: "SANARE TIKANI", regNumber: "S084-01-2229/2024", gender: "MALE", course: "BSC. MATHEMATICS AND MODELLING", school: "MATHEMATICAL AND PHYSICAL SCIENCE" },
            { name: "YVONNE WANGOI", regNumber: "S084-01-2393/2025", gender: "FEMALE", course: "BSC. MATHEMATICS AND MODELLING", school: "MATHEMATICAL AND PHYSICAL SCIENCE" },
            { name: "CYNTHIA WANJIKU", regNumber: "S084-01-2209/2024", gender: "FEMALE", course: "BSC. MATHEMATICS AND MODELLING", school: "MATHEMATICAL AND PHYSICAL SCIENCE" },
            
            // NAIROBI CAMPUS
            { name: "SIMON ODHIAMBO OUKO", regNumber: "B03-03-0060/2024", gender: "MALE", course: "BSC. CRIMINOLOGY", school: "NAIROBI CAMPUS" },
            { name: "HADASSAH THIAKA", regNumber: "B013-03-0019/2025", gender: "FEMALE", course: "BSC. CRIMINOLOGY", school: "NAIROBI CAMPUS" },
            { name: "OTIENO JAMES", regNumber: "B013-03-0040/2025", gender: "MALE", course: "BSC. CRIMINOLOGY", school: "NAIROBI CAMPUS" }
        ];

        // Group delegates by school
        const groupedDelegates = delegates.reduce((acc, delegate) => {
            if (!acc[delegate.school]) {
                acc[delegate.school] = [];
            }
            acc[delegate.school].push(delegate);
            return acc;
        }, {});

        // Generate placeholder images based on gender
        function getPlaceholderImage(gender) {
            const maleImages = [
'https://mmg.whatsapp.net/m1/v/t24/An-jLysv0GNtqtnXQbPAkueMKejNye-umKIJm0eCedphJxZPEzjLqVBxJ14Csk6WVmXQHvP40aB4uq3VNa3j_aRpkTk85uoWBqgeB9IPGnTu6jf2tdUGP8pSiNIq82yF9IYVqmym0lTG5xUsoeIg?_nc_gid=GXiLr1RKNv9aHkMAFFaylA&_nc_oc=AdlasXU3KHLbOjpGJ9rJSyBQ2JSQMLQhMO19WO1Ye56HivH7BA00xGrz8Pd1ozY2d8Q&ccb=10-5&oh=01_Q5Aa2wFyMl79ulkWZalZ1p9636w2cf1H2dQlyTBwmgww0QEQ4g&oe=6925617A&_nc_sid=471a72'
            ];
            
            const femaleImages = [
                'https://mmg.whatsapp.net/m1/v/t24/An-jLysv0GNtqtnXQbPAkueMKejNye-umKIJm0eCedphJxZPEzjLqVBxJ14Csk6WVmXQHvP40aB4uq3VNa3j_aRpkTk85uoWBqgeB9IPGnTu6jf2tdUGP8pSiNIq82yF9IYVqmym0lTG5xUsoeIg?_nc_gid=GXiLr1RKNv9aHkMAFFaylA&_nc_oc=AdlasXU3KHLbOjpGJ9rJSyBQ2JSQMLQhMO19WO1Ye56HivH7BA00xGrz8Pd1ozY2d8Q&ccb=10-5&oh=01_Q5Aa2wFyMl79ulkWZalZ1p9636w2cf1H2dQlyTBwmgww0QEQ4g&oe=6925617A&_nc_sid=471a72'
            ];
            
            const images = gender === 'FEMALE' ? femaleImages : maleImages;
            return images[Math.floor(Math.random() * images.length)];
        }

        // Render delegates
        function renderDelegates() {
            const container = document.getElementById('mainContainer');
            const loading = document.getElementById('loading');
            
            // Clear loading message
            loading.style.display = 'none';
            
            // Create sections for each institution
            Object.keys(groupedDelegates).forEach((school, index) => {
                const section = document.createElement('div');
                section.className = 'institution-section';
                section.id = `section-${index}`;
                
                // Create institution header with vote button
                const header = document.createElement('div');
                header.className = 'institution-header';
                header.innerHTML = `
                    <div class="institution-name">${school}</div>
                    <a href="https://whatsapp.com/channel/0029VbAb8L46WaKx34k8vU0S/2378" 
                       class="vote-btn" target="_blank">
                        🗳️ Vote Now
                    </a>
                `;
                section.appendChild(header);

                // Create grid for delegate cards
                const grid = document.createElement('div');
                grid.className = 'delegates-grid';

                // Add delegate cards
                groupedDelegates[school].forEach((delegate, idx) => {
                    const card = document.createElement('div');
                    card.className = 'delegate-card';
                    card.id = `delegate-${delegate.regNumber.toLowerCase().replace(/\//g, '-')}`;
                    
                    // Use actual photo if available, otherwise use placeholder
                    const photoUrl = delegate.photoUrl || getPlaceholderImage(delegate.gender);
                    
                    card.innerHTML = `
                        <a href="https://whatsapp.com/channel/0029VbAb8L46WaKx34k8vU0S/2378" 
                           class="vote-btn-individual" target="_blank" title="Vote for ${delegate.name}">
                            VOTE
                        </a>
                        <button class="share-btn" data-reg="${delegate.regNumber}" title="Share this delegate">
                            SHARE
                        </button>
                        <div class="share-tooltip">Click to share this delegate</div>
                        <div class="delegate-photo">
                            <img src="${photoUrl}" alt="${delegate.name}" 
                                 onerror="this.src='${getPlaceholderImage(delegate.gender)}'" 
                                 loading="lazy">
                        </div>
                        <div class="delegate-info">
                            <div class="delegate-name">${delegate.name}</div>
                            <div class="reg-number">${delegate.regNumber}</div>
                            <div class="detail-row">
                                <span class="label">Gender:</span>
                                <span class="gender ${delegate.gender.toLowerCase()}">${delegate.gender}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Course:</span>
                                <span class="value">${delegate.course}</span>
                            </div>
                        </div>
                    `;

                    // Animate card appearance with delay
                    setTimeout(() => {
                        card.classList.add('loaded');
                    }, idx * 100);

                    grid.appendChild(card);
                });

                section.appendChild(grid);
                container.appendChild(section);
            });
            
            // Add event listeners to share buttons
            document.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const regNumber = this.getAttribute('data-reg');
                    shareDelegate(regNumber);
                });
            });
            
            // Initialize intersection observer after rendering
            initIntersectionObserver();
            
            // Check if we need to highlight a specific delegate from URL
            checkUrlForDelegate();
        }

        // Share delegate function
        function shareDelegate(regNumber) {
            // Find the delegate by registration number
            const delegate = delegates.find(d => d.regNumber === regNumber);
            if (!delegate) return;
            
            // Create a shareable URL with the delegate's registration number
            const shareUrl = `${window.location.origin}${window.location.pathname}#delegate-${delegate.regNumber.toLowerCase().replace(/\//g, '-')}`;
            
            // Create share text
            const shareText = `Check out ${delegate.name} (${delegate.regNumber}) - ${delegate.course} at DeKUTSO Delegate Showcase 2025!`;
            
            // Create the actual share URL for WhatsApp and other platforms
            const encodedShareText = encodeURIComponent(shareText);
            const encodedShareUrl = encodeURIComponent(shareUrl);
            
            // Create a share dialog with options for different platforms
            const shareDialog = document.createElement('div');
            shareDialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const shareContent = document.createElement('div');
            shareContent.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 10px;
                max-width: 90%;
                width: 400px;
                text-align: center;
                color: #333;
            `;
            
            shareContent.innerHTML = `
                <h3>Share ${delegate.name}</h3>
                <p>Choose a platform to share:</p>
                <div style="display: flex; justify-content: center; gap: 10px; margin: 20px 0;">
                    <a href="https://wa.me/?text=${encodedShareText}%20${encodedShareUrl}" 
                       target="_blank" 
                       style="background: #25D366; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none;">
                        WhatsApp
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedShareUrl}" 
                       target="_blank" 
                       style="background: #1DA1F2; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none;">
                        Twitter
                    </a>
                    <button onclick="navigator.clipboard.writeText('${shareText} ${shareUrl}').then(() => alert('Copied to clipboard!'))" 
                            style="background: #6c757d; color: white; padding: 10px 15px; border-radius: 5px; border: none; cursor: pointer;">
                        Copy Link
                    </button>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #dc3545; color: white; padding: 8px 15px; border-radius: 5px; border: none; cursor: pointer;">
                    Close
                </button>
            `;
            
            shareDialog.appendChild(shareContent);
            document.body.appendChild(shareDialog);
            
            // Close dialog when clicking outside
            shareDialog.addEventListener('click', function(e) {
                if (e.target === shareDialog) {
                    shareDialog.remove();
                }
            });
        }

        // Check URL for delegate parameter and highlight it
        function checkUrlForDelegate() {
            const hash = window.location.hash;
            if (hash) {
                const regNumber = hash.substring(1); // Remove the # symbol
                highlightDelegate(regNumber);
            }
        }

        // Highlight a specific delegate
        function highlightDelegate(regNumber) {
            const delegateCard = document.getElementById(regNumber);
            if (delegateCard) {
                // Scroll to the delegate
                delegateCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add highlight class
                delegateCard.classList.add('highlighted');
                
                // Remove highlight after 5 seconds
                setTimeout(() => {
                    delegateCard.classList.remove('highlighted');
                }, 5000);
            }
        }

        // Intersection Observer for scroll animations
        function initIntersectionObserver() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            // Observe all sections
            document.querySelectorAll('.institution-section').forEach(section => {
                observer.observe(section);
            });
        }

        // Listen for hash changes to highlight delegates when URL changes
        window.addEventListener('hashchange', function() {
            checkUrlForDelegate();
        });

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', renderDelegates);
