import { SholatStepInfo } from '../types/database';

export const SHOLAT_STEPS: SholatStepInfo[] = [
  {
    step_code: 'BERDIRI_DAN_NIAT',
    step_order: 1,
    title: 'Berdiri Menghadap Kiblat & Niat',
    arabic_title: 'الْقِيَامُ وَالنِّيَّةُ',
    description: 'Berdiri tegak menghadap kiblat dengan pandangan mengarah ke tempat sujud. Niat sholat berada di dalam hati dengan tulus semata-mata karena Allah (tanpa melafalkan "Ushalli..." secara lisan karena tidak dicontohkan Rasulullah ﷺ).',
    dalil: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    dalil_source: 'HR. Bukhari no. 1 & Muslim no. 1907; Sifat Shalat Nabi hal. 86',
    arabic_reading: 'بِسْمِ اللَّهِ (فِي الْقَلْبِ)',
    latin_reading: 'Niat cukup di dalam hati menghadap kiblat',
    translation: 'Meniatkan sholat yang akan didirikan secara ikhlas di dalam hati.',
    posture: 'stand'
  },
  {
    step_code: 'TAKBIRATUL_IHRAM',
    step_order: 2,
    title: 'Takbiratul Ihram',
    arabic_title: 'تَكْبِيرَةُ الإِحْرَامِ',
    description: 'Mengucapkan takbir seraya mengangkat kedua tangan sejajar bahu atau sejajar daun telinga, jari-jari direntangkan wajar dan telapak tangan menghadap kiblat.',
    dalil: 'كَانَ ﷺ يَرْفَعُ يَدَيْهِ حَذْوَ مَنْكِبَيْهِ إِذَا افْتَتَحَ الصَّلاَةَ',
    dalil_source: 'HR. Bukhari no. 735 & Muslim no. 390',
    arabic_reading: 'اللهُ أَكْبَرُ',
    latin_reading: 'Allāhu Akbar',
    translation: 'Allah Maha Besar.',
    posture: 'takbir'
  },
  {
    step_code: 'BERSEDEKAP_ISTIFTAH',
    step_order: 3,
    title: 'Bersedekap di Dada & Doa Istiftah',
    arabic_title: 'الْقَبْضُ عَلَى الصَّدْرِ وَدُعَاءُ الاسْتِفْتَاحِ',
    description: 'Meletakkan tangan kanan di atas punggung telapak tangan kiri, pergelangan, atau lengan bawah, lalu diletakkan tepat di atas dada. Membaca doa istiftah shahih (tersedia beberapa opsi shahih sesuai yang diajarkan di sekolah).',
    dalil: 'كَانَ يَضَعُ يَدَهُ الْيُمْنَى عَلَى ظَهْرِ كَفِّهِ الْيُسْرَى وَالرُّسْغِ وَالسَّاعِدِ عَلَى صَدْرِهِ',
    dalil_source: 'HR. Abu Dawud no. 759 & Ahmad 5/226 (Sanad Shahih)',
    arabic_reading: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
    latin_reading: 'Subḥānakallāhumma wa biḥamdika, wa tabārakasmuka, wa ta\'ālā jadduka, wa lā ilāha ghairuk.',
    translation: 'Maha Suci Engkau ya Allah, segala puji bagi-Mu, berkah nama-Mu, maha tinggi keagungan-Mu, dan tidak ada sesembahan yang berhak disembah selain Engkau.',
    posture: 'fold_chest',
    reading_options: [
      {
        id: 'istiftah-subhanaka',
        label: 'Opsi 1: Subhanakallahumma (Ringkas untuk Anak)',
        is_short_for_kids: true,
        arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
        latin: 'Subḥānakallāhumma wa biḥamdika, wa tabārakasmuka, wa ta\'ālā jadduka, wa lā ilāha ghairuk.',
        translation: 'Maha Suci Engkau ya Allah, segala puji bagi-Mu, berkah nama-Mu, maha tinggi keagungan-Mu, dan tidak ada sesembahan yang berhak disembah selain Engkau.',
        source: 'HR. Abu Dawud no. 775, Tirmidzi no. 242 (Sifat Shalat Nabi hal. 93)'
      },
      {
        id: 'istiftah-baid',
        label: 'Opsi 2: Allahumma Ba\'id Bayni (Doa Populer Bukhari-Muslim)',
        is_short_for_kids: false,
        arabic: 'اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ',
        latin: 'Allāhumma bā\'id bainī wa baina khaṭāyāya kamā bā\'adta bainal-masyriqi wal-maghrib, Allāhumma naqqinī minal-khaṭāyā kamā yunaqqats-tsaubul-abyaḍu minad-danas, Allāhummaghsil khaṭāyāya bil-mā\'i wats-tsalji wal-barad.',
        translation: 'Ya Allah, jauhkanlah antara aku dan kesalahan-kesalahanku sebagaimana Engkau menjauhkan antara timur dan barat. Ya Allah, bersihkanlah aku dari kesalahan sebagaimana baju putih dibersihkan dari kotoran. Ya Allah, cucilah kesalahanku dengan air, salju, dan es.',
        source: 'HR. Bukhari no. 744 & Muslim no. 598'
      },
      {
        id: 'istiftah-wajjahtu',
        label: 'Opsi 3: Wajjahtu Wajhiya (HR. Muslim)',
        is_short_for_kids: false,
        arabic: 'وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالأَرْضَ حَنِيفًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ، إِنَّ صَلاَتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ، لاَ شَرِيكَ لَهُ وَبِذَلِكَ أُمِرْتُ وَأَنَا مِنَ الْمُسْلِمِينَ',
        latin: 'Wajjahtu wajhiya lilladzī faṭaras-samāwāti wal-arḍa ḥanīfaw wa mā ana minal-musyrikīn, inna ṣalātī wa nusukī wa maḥyāya wa mamātī lillāhi rabbil-\'ālamīn, lā syarīka lahū wa bidzālika umirtu wa ana minal-muslimīn.',
        translation: 'Aku hadapkan wajahku kepada Dzat yang menciptakan langit dan bumi dengan lurus, dan aku bukanlah termasuk orang-orang musyrik...',
        source: 'HR. Muslim no. 771 (Sifat Shalat Nabi hal. 94)'
      }
    ]
  },
  {
    step_code: 'AL_FATIHAH',
    step_order: 4,
    title: 'Ta\'awudz, Basmalah & Al-Fatihah',
    arabic_title: 'قِرَاءَةُ الْفَاتِحَةِ وَالسُّورَةِ',
    description: 'Membaca ta\'awudz pelan, basmalah pelan (sirr), lalu membaca Surat Al-Fatihah ayat demi ayat (berhenti di setiap akhir ayat), mengucapkan "Aamiin", dilanjutkan membaca surat dari Juz 30.',
    dalil: 'لاَ صَلاَةَ لِمَنْ لَمْ يَقْرَأْ بِفَاتِحَةِ الْكِتَابِ',
    dalil_source: 'HR. Bukhari no. 756 & Muslim no. 394',
    arabic_reading: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ • بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ • الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...',
    latin_reading: 'A\'ūdzu billāhi minasy-syaithānir-rajīm. Bismillāhir-raḥmānir-raḥīm. Al-ḥamdu lillāhi rabbil-\'ālamīn...',
    translation: 'Aku berlindung kepada Allah dari godaan setan yang terkutuk. Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Rabb semesta alam...',
    posture: 'fold_chest'
  },
  {
    step_code: 'RUKU',
    step_order: 5,
    title: 'Ruku\' dengan Thuma\'ninah',
    arabic_title: 'الرُّكُوعُ وَالطُّمَأْنِينَةُ',
    description: 'Mengangkat tangan sambil takbir, membungkukkan badan hingga punggung rata 90 derajat, tangan menggenggam kedua lutut dengan jari-jari direnggangkan.',
    dalil: 'إِذَا رَكَعْتَ فَأَمْكِنْ كَفَّيْكَ مِنْ رُكْبَتَيْكَ وَفَرِّجْ بَيْنَ أَصَابِعِكَ وَاطْمَئِنَّ',
    dalil_source: 'HR. Abu Dawud no. 863 & Ahmad',
    arabic_reading: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ (٣x)',
    latin_reading: 'Subḥāna rabbiyal-\'aẓīm (3x)',
    translation: 'Maha Suci Rabbku Yang Maha Agung (dibaca 3 kali dengan tenang).',
    posture: 'ruku',
    reading_options: [
      {
        id: 'ruku-subhana-azim',
        label: 'Opsi 1: Subhana Rabbiyal \'Azhim (3x)',
        is_short_for_kids: true,
        arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ (٣x)',
        latin: 'Subḥāna rabbiyal-\'aẓīm (3x)',
        translation: 'Maha Suci Rabbku Yang Maha Agung (dibaca 3 kali).',
        source: 'HR. Abu Dawud no. 871, Tirmidzi no. 260'
      },
      {
        id: 'ruku-subhanakallahumma',
        label: 'Opsi 2: Subhanakallahumma Rabbana wa Bihamdika',
        is_short_for_kids: false,
        arabic: 'سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ اللَّهُمَّ اغْفِرْ لِي',
        latin: 'Subḥānakallāhumma rabbanā wa biḥamdika, Allāhummaghfir lī.',
        translation: 'Maha Suci Engkau ya Allah, Rabb kami, dan dengan memuji-Mu. Ya Allah, ampunilah dosaku.',
        source: 'HR. Bukhari no. 794 & Muslim no. 484'
      },
      {
        id: 'ruku-subbuhun',
        label: 'Opsi 3: Subbuhun Quddusun (HR. Muslim)',
        is_short_for_kids: true,
        arabic: 'سُبُّوحٌ قُدُّوسٌ، رَبُّ الْمَلاَئِكَةِ وَالرُّوحِ',
        latin: 'Subbūḥun quddūs, rabbul-malā\'ikati war-rūḥ.',
        translation: 'Maha Suci lagi Maha Bersih, Rabb para malaikat dan malaikat Jibril.',
        source: 'HR. Muslim no. 487'
      }
    ]
  },
  {
    step_code: 'ITIDAL',
    step_order: 6,
    title: 'I\'tidal (Bangkit dari Ruku\')',
    arabic_title: 'الاعْتِدَالُ مِنَ الرُّكُوعِ',
    description: 'Bangkit dari ruku\' sambil mengangkat kedua tangan seraya membaca "Sami\'allahu liman hamidah", lalu berdiri tegak lurus thuma\'ninah seraya membaca doa pujian.',
    dalil: 'ثُمَّ ارْفَعْ حَتَّى تَعْتَدِلَ قَائِمًا فَتَطْمَئِنَّ',
    dalil_source: 'HR. Bukhari no. 757 & Muslim no. 397',
    arabic_reading: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ • رَبَّنَا وَلَكَ الْحَمْدُ، حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ',
    latin_reading: 'Sami\'allāhu liman ḥamidah. Rabbanā wa lakal-ḥamdu, ḥamdan katsīran ṭayyiban mubārakan fīh.',
    translation: 'Allah mendengar orang yang memuji-Nya. Wahai Rabb kami, bagi-Mu segala puji, pujian yang banyak, baik, lagi penuh keberkahan.',
    posture: 'itidal',
    reading_options: [
      {
        id: 'itidal-hamdan-kasiran',
        label: 'Opsi 1: Hamdan Katsiran Tayyiban (Pujian Paling Afdhol)',
        is_short_for_kids: false,
        arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ • رَبَّنَا وَلَكَ الْحَمْدُ، حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ',
        latin: 'Sami\'allāhu liman ḥamidah. Rabbanā wa lakal-ḥamdu, ḥamdan katsīran ṭayyiban mubārakan fīh.',
        translation: 'Allah mendengar orang yang memuji-Nya. Wahai Rabb kami, bagi-Mu segala puji, pujian yang banyak, baik, lagi penuh berkah.',
        source: 'HR. Bukhari no. 799'
      },
      {
        id: 'itidal-ringkas',
        label: 'Opsi 2: Rabbana wa Lakal Hamd (Ringkas untuk Anak)',
        is_short_for_kids: true,
        arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ • رَبَّنَا وَلَكَ الْحَمْدُ',
        latin: 'Sami\'allāhu liman ḥamidah. Rabbanā wa lakal-ḥamd.',
        translation: 'Allah mendengar orang yang memuji-Nya. Wahai Rabb kami, bagi-Mu segala puji.',
        source: 'HR. Bukhari no. 795 & Muslim no. 409'
      },
      {
        id: 'itidal-mil-ussamawati',
        label: 'Opsi 3: Mil-us Samawati wal Ardh (HR. Muslim)',
        is_short_for_kids: false,
        arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ • رَبَّنَا لَكَ الْحَمْدُ مِلْءَ السَّمَاوَاتِ وَمِلْءَ الأَرْضِ وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ',
        latin: 'Sami\'allāhu liman ḥamidah. Rabbanā lakal-ḥamdu mil\'as-samāwāti wa mil\'al-arḍi wa mil\'a mā syi\'ta min syai\'in ba\'d.',
        translation: 'Allah mendengar orang yang memuji-Nya. Wahai Rabb kami, bagi-Mu segala puji sepenuh langit, sepenuh bumi, dan sepenuh apa saja yang Engkau kehendaki setelah itu.',
        source: 'HR. Muslim no. 477'
      }
    ]
  },
  {
    step_code: 'SUJUD_7_ANGGOTA',
    step_order: 7,
    title: 'Sujud pada 7 Anggota Tubuh',
    arabic_title: 'السُّجُودُ عَلَى سَبْعَةِ أَعْظُمٍ',
    description: 'Turun sujud sambil bertakbir tanpa mengangkat tangan. Menempelkan 7 anggota sujud: 1. Dahi dan hidung, 2-3. Kedua telapak tangan, 4-5. Kedua lutut, 6-7. Kedua ujung jari-jari kaki ditekuk menghadap kiblat. Mengangkat kedua siku dari lantai.',
    dalil: 'أُمِرْتُ أَنْ أَسْجُدَ عَلَى سَبْعَةِ أَعْظُمٍ: عَلَى الْجَبْهَةِ -وَأَشَارَ بِيَدِهِ عَلَى أَنْفِهِ- وَالْيَدَيْنِ، وَالرُّكْبَتَيْنِ، وَأَطْرَافِ الْقَدَمَيْنِ',
    dalil_source: 'HR. Bukhari no. 812 & Muslim no. 490',
    arabic_reading: 'سُبْحَانَ رَبِّيَ الأَعْلَى (٣x)',
    latin_reading: 'Subḥāna rabbiyal-a\'lā (3x)',
    translation: 'Maha Suci Rabbku Yang Maha Tinggi (dibaca 3 kali dengan tenang).',
    posture: 'sujud',
    reading_options: [
      {
        id: 'sujud-subhana-ala',
        label: 'Opsi 1: Subhana Rabbiyal A\'la (3x)',
        is_short_for_kids: true,
        arabic: 'سُبْحَانَ رَبِّيَ الأَعْلَى (٣x)',
        latin: 'Subḥāna rabbiyal-a\'lā (3x)',
        translation: 'Maha Suci Rabbku Yang Maha Tinggi (dibaca 3 kali).',
        source: 'HR. Abu Dawud no. 871, Tirmidzi no. 261, Muslim no. 772'
      },
      {
        id: 'sujud-subhanakallahumma',
        label: 'Opsi 2: Subhanakallahumma Rabbana wa Bihamdika',
        is_short_for_kids: false,
        arabic: 'سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ اللَّهُمَّ اغْفِرْ لِي',
        latin: 'Subḥānakallāhumma rabbanā wa biḥamdika, Allāhummaghfir lī.',
        translation: 'Maha Suci Engkau ya Allah, Rabb kami, dan dengan memuji-Mu. Ya Allah, ampunilah dosaku.',
        source: 'HR. Bukhari no. 794 & Muslim no. 484'
      },
      {
        id: 'sujud-subbuhun',
        label: 'Opsi 3: Subbuhun Quddusun (HR. Muslim)',
        is_short_for_kids: true,
        arabic: 'سُبُّوحٌ قُدُّوسٌ، رَبُّ الْمَلاَئِكَةِ وَالرُّوحِ',
        latin: 'Subbūḥun quddūs, rabbul-malā\'ikati war-rūḥ.',
        translation: 'Maha Suci lagi Maha Bersih, Rabb para malaikat dan malaikat Jibril.',
        source: 'HR. Muslim no. 487'
      },
      {
        id: 'sujud-allahummaghfirli-dzanbi',
        label: 'Opsi 4: Doa Ampunan Dosa Besar & Kecil (HR. Muslim)',
        is_short_for_kids: false,
        arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلاَنِيَتَهُ وَسِرَّهُ',
        latin: 'Allāhummaghfir lī dzanbī kullah, diqqahū wa jillah, wa awwalahū wa ākhirah, wa \'alāniyatahū wa sirrah.',
        translation: 'Ya Allah, ampunilah seluruh dosaku, yang kecil maupun yang besar, yang awal maupun yang akhir, yang terang-terangan maupun yang tersembunyi.',
        source: 'HR. Muslim no. 483'
      }
    ]
  },
  {
    step_code: 'DUDUK_IFTIRASY',
    step_order: 8,
    title: 'Duduk di Antara Dua Sujud',
    arabic_title: 'الْجُلُوسُ بَيْنَ السَّجْدَتَيْنِ (افْتِرَاش)',
    description: 'Bangkit dari sujud seraya bertakbir, duduk iftirasy yaitu membentangkan punggung kaki kiri dan duduk di atasnya, sedangkan telapak kaki kanan ditegakkan dengan jari-jari menghadap kiblat.',
    dalil: 'وَإِذَا جَلَسَ فَرَشَ رِجْلَهُ الْيُسْرَى وَنَصَبَ الْيُمْنَى',
    dalil_source: 'HR. Bukhari no. 828',
    arabic_reading: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
    latin_reading: 'Rabbighfir lī, Rabbighfir lī',
    translation: 'Wahai Rabbku, ampunilah dosaku, wahai Rabbku, ampunilah dosaku.',
    posture: 'iftirasy',
    reading_options: [
      {
        id: 'duduk-rabbighfirli',
        label: 'Opsi 1: Rabbighfirli 2x (Ringkas & Shahih)',
        is_short_for_kids: true,
        arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
        latin: 'Rabbighfir lī, Rabbighfir lī',
        translation: 'Wahai Rabbku, ampunilah dosaku, wahai Rabbku, ampunilah dosaku.',
        source: 'HR. Abu Dawud no. 874, Ibnu Majah no. 897 (Shahih)'
      },
      {
        id: 'duduk-lengkap',
        label: 'Opsi 2: Doa 5 Permohonan Lengkap (HR. Abu Dawud & Tirmidzi)',
        is_short_for_kids: false,
        arabic: 'اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاجْبُرْنِي، وَاهْدِنِي، وَارْزُقْنِي',
        latin: 'Allāhummaghfir lī, warḥamnī, wajburnī, wahdinī, warzuqnī.',
        translation: 'Ya Allah, ampunilah aku, rahmatilah aku, cukupkanlah kekuranganku, berilah aku petunjuk, dan berilah aku rezeki.',
        source: 'HR. Abu Dawud no. 850 & Tirmidzi no. 284'
      }
    ]
  },
  {
    step_code: 'JALSATUL_ISTIRAHAH',
    step_order: 9,
    title: 'Duduk Istirahat Sejenak',
    arabic_title: 'جَلْسَةُ الاسْتِرَاحَةِ',
    description: 'Setelah sujud kedua pada rakaat pertama dan rakaat ketiga, duduk sejenak dengan tenang secara iftirasy sebelum bangkit berdiri ke rakaat berikutnya dengan bertumpu pada kedua tangan.',
    dalil: 'كَانَ إِذَا كَانَ فِي وِتْرٍ مِنْ صَلاَتِهِ لَمْ يَنْهَضْ حَتَّى يَسْتَوِيَ قَاعِدًا',
    dalil_source: 'HR. Bukhari no. 823 (Hadits Malik bin Al-Huwairits)',
    arabic_reading: 'اللهُ أَكْبَرُ (عِنْدَ النُّهُوضِ)',
    latin_reading: 'Bertakbir dan bangkit bertumpu pada kedua tangan',
    translation: 'Duduk sejenak dengan thuma\'ninah, kemudian bangkit seraya bertakbir.',
    posture: 'iftirasy'
  },
  {
    step_code: 'TASYAHUD_AWAL',
    step_order: 10,
    title: 'Tasyahud Awal & Isyarat Telunjuk',
    arabic_title: 'التَّشَهُّدُ الأَوَّلُ وَالإِشَارَةُ بِالسَّبَّابَةِ',
    description: 'Duduk iftirasy pada rakaat kedua, meletakkan tangan kiri di lutut kiri dan tangan kanan di paha kanan dengan jari telunjuk mengisyaratkan ke arah kiblat sejak awal tasyahud dan pandangan mata tertuju ke telunjuk.',
    dalil: 'وَأَشَارَ بِأُصْبُعِهِ السَّبَّابَةِ وَرَمَى بِبَصَرِهِ إِلَيْهَا',
    dalil_source: 'HR. Abu Dawud no. 989 & An-Nasa\'i no. 1275 (Shahih)',
    arabic_reading: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    latin_reading: 'At-taḥiyyātu lillāh, waṣ-ṣalawātu, waṭ-ṭayyibāt. As-salāmu \'alaika ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh. As-salāmu \'alainā wa \'alā \'ibādillāhiṣ-ṣāliḥīn. Asyhadu allā ilāha illallāh, wa asyhadu anna Muḥammadan \'abduhū wa rasūluh.',
    translation: 'Segala ucapan selamat, shalawat, dan kebaikan hanyalah milik Allah. Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu wahai Nabi...',
    posture: 'iftirasy',
    reading_options: [
      {
        id: 'tasyahud-ibnu-masud',
        label: 'Opsi 1: Tasyahud Ibnu Mas\'ud (Paling Shahih & Dianjurkan)',
        is_short_for_kids: true,
        arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        latin: 'At-taḥiyyātu lillāh, waṣ-ṣalawātu, waṭ-ṭayyibāt. As-salāmu \'alaika ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh. As-salāmu \'alainā wa \'alā \'ibādillāhiṣ-ṣāliḥīn. Asyhadu allā ilāha illallāh, wa asyhadu anna Muḥammadan \'abduhū wa rasūluh.',
        translation: 'Segala ucapan selamat, shalawat, dan kebaikan hanyalah milik Allah. Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu wahai Nabi...',
        source: 'HR. Bukhari no. 831 & Muslim no. 402'
      },
      {
        id: 'tasyahud-ibnu-abbas',
        label: 'Opsi 2: Tasyahud Ibnu Abbas (Al-Mubarakatu)',
        is_short_for_kids: false,
        arabic: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
        latin: 'At-taḥiyyātul-mubārakātuṣ-ṣalawātuṭ-ṭayyibātu lillāh. As-salāmu \'alaika ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh. As-salāmu \'alainā wa \'alā \'ibādillāhiṣ-ṣāliḥīn. Asyhadu allā ilāha illallāh, wa asyhadu anna Muḥammadan rasūlullāh.',
        translation: 'Segala ucapan selamat yang penuh berkah, shalawat, dan kebaikan hanyalah milik Allah. Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu wahai Nabi...',
        source: 'HR. Muslim no. 403'
      }
    ]
  },
  {
    step_code: 'TASYAHUD_AKHIR',
    step_order: 11,
    title: 'Tasyahud Akhir (Duduk Tawarruk) & Shalawat',
    arabic_title: 'التَّشَهُّدُ الأَخِيرُ (التَّوَرُّكُ) وَالصَّلاَةُ الإِبْرَاهِيمِيَّةُ',
    description: 'Duduk tawarruk yaitu memasukkan kaki kiri di bawah betis kanan, mendudukkan pantat langsung ke lantai/sajadah, dan menegakkan kaki kanan. Membaca tasyahud dilanjutkan Shalawat Ibrahimiyah.',
    dalil: 'فَإِذَا كَانَتِ الرَّكْعَةُ الَّتِي فِيهَا التَّسْلِيمُ أَخْرَجَ رِجْلَهُ الْيُسْرَى وَجَلَسَ مُتَوَرِّكًا عَلَى شِقِّهِ الأَيْسَرِ',
    dalil_source: 'HR. Bukhari no. 828',
    arabic_reading: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
    latin_reading: 'Allāhumma ṣalli \'alā Muḥammad, wa \'alā āli Muḥammad, kamā ṣallaita \'alā Ibrāhīm, wa \'alā āli Ibrāhīm, innaka ḥamīdum majīd. Allāhumma bārik \'alā Muḥammad, wa \'alā āli Muḥammad, kamā bārakta \'alā Ibrāhīm, wa \'alā āli Ibrāhīm, innaka ḥamīdum majīd.',
    translation: 'Ya Allah, berilah shalawat kepada Muhammad dan kepada keluarga Muhammad sebagaimana Engkau telah bershalawat kepada Ibrahim dan kepada keluarga Ibrahim...',
    posture: 'tawarruk',
    reading_options: [
      {
        id: 'shalawat-kaab',
        label: 'Opsi 1: Shalawat Ibrahimiyah (Ka\'ab bin Ujrah)',
        is_short_for_kids: true,
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
        latin: 'Allāhumma ṣalli \'alā Muḥammad, wa \'alā āli Muḥammad, kamā ṣallaita \'alā Ibrāhīm, wa \'alā āli Ibrāhīm, innaka ḥamīdum majīd. Allāhumma bārik \'alā Muḥammad, wa \'alā āli Muḥammad, kamā bārakta \'alā Ibrāhīm, wa \'alā āli Ibrāhīm, innaka ḥamīdum majīd.',
        translation: 'Ya Allah, berilah shalawat kepada Muhammad dan kepada keluarga Muhammad sebagaimana Engkau telah bershalawat kepada Ibrahim...',
        source: 'HR. Bukhari no. 3370 & Muslim no. 406'
      },
      {
        id: 'shalawat-abu-humaid',
        label: 'Opsi 2: Shalawat Riwayat Abu Humaid As-Sa\'idi',
        is_short_for_kids: false,
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَأَزْوَاجِهِ وَذُرِّيَّتِهِ، كَمَا صَلَّيْتَ عَلَى آلِ إِبْرَاهِيمَ، وَبَارِكْ عَلَى مُحَمَّدٍ وَأَزْوَاجِهِ وَذُرِّيَّتِهِ، كَمَا بَارَكْتَ عَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
        latin: 'Allāhumma ṣalli \'alā Muḥammadiw wa azwājihī wa dzurriyyatih, kamā ṣallaita \'alā āli Ibrāhīm, wa bārik \'alā Muḥammadiw wa azwājihī wa dzurriyyatih, kamā bārakta \'alā āli Ibrāhīm, innaka ḥamīdum majīd.',
        translation: 'Ya Allah, limpahkanlah shalawat kepada Muhammad, istri-istrinya, dan keturunannya, sebagaimana Engkau telah melimpahkan shalawat kepada keluarga Ibrahim...',
        source: 'HR. Bukhari no. 3369 & Muslim no. 407'
      }
    ]
  },
  {
    step_code: 'DOA_4_FITNAH',
    step_order: 12,
    title: 'Doa Perlindungan dari 4 Fitnah',
    arabic_title: 'الدُّعَاءُ قَبْلَ السَّلاَمِ مِنَ الأَرْبَعِ',
    description: 'Memohon perlindungan kepada Allah dari 4 fitnah besar setelah tasyahud dan shalawat sebelum mengucapkan salam.',
    dalil: 'إِذَا فَرَغَ أَحَدُكُمْ مِنَ التَّشَهُّدِ الآخِرِ فَلْيَتَعَوَّذْ بِاللَّهِ مِنْ أَرْبَعٍ',
    dalil_source: 'HR. Muslim no. 588',
    arabic_reading: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
    latin_reading: 'Allāhumma innī a\'ūdzu bika min \'adzābi jahannam, wa min \'adzābil-qabri, wa min fitnatil-maḥyā wal-mamāt, wa min syarri fitnatil-masīḥid-dajjāl.',
    translation: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari azab Jahannam, dari azab kubur, dari fitnah kehidupan dan kematian, serta dari keburukan fitnah Al-Masih Ad-Dajjal.',
    posture: 'tawarruk'
  },
  {
    step_code: 'SALAM_DZIKIR',
    step_order: 13,
    title: 'Salam & Dzikir Ba\'da Sholat Shahih',
    arabic_title: 'التَّسْلِيمُ وَالأَذْكَارُ الْمَأْثُورَةُ',
    description: 'Menolehkan wajah ke kanan sampai terlihat pipi putih seraya berucap salam, lalu menoleh ke kiri seraya berucap salam. Dilanjutkan beristighfar 3x dan membaca dzikir yang diajarkan Rasulullah ﷺ.',
    dalil: 'كَانَ يُسَلِّمُ عَنْ يَمِينِهِ وَعَنْ يَسَارِهِ: السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ، حَتَّى يُرَى بَيَاضُ خَدِّهِ',
    dalil_source: 'HR. Muslim no. 582 & Abu Dawud no. 996',
    arabic_reading: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ (يَمِينًا وَيَسَارًا) • أَسْتَغْفِرُ اللَّهَ (٣x) • اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
    latin_reading: 'As-salāmu \'alaikum wa raḥmatullāh (ke kanan dan kiri). Astaghfirullāh (3x). Allāhumma antas-salām wa minkas-salām, tabārakta yā dzal-jalāli wal-ikrām.',
    translation: 'Semoga keselamatan dan rahmat Allah tercurah kepada kalian. Aku memohon ampun kepada Allah (3x). Ya Allah, Engkaulah As-Salam (Yang Selamat dari segala kekurangan)...',
    posture: 'salam'
  }
];
