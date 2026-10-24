# 術語表

| 中文 | 英文 | 一句話解釋 | 第一次出現 |
|---|---|---|---|
| 閘極絕緣層 | Gate Dielectric | 閘極和通道之間的極薄絕緣牆，讓電場過去、擋住電子 | hk1 |
| 量子穿隧 | Quantum Tunneling | 牆夠薄時，電子不用翻過牆，也有機率直接出現在另一邊 | hk2 |
| 閘極漏電 | Gate Leakage | 電子從通道穿過絕緣牆跑進閘極，形成不該有的電流 | hk2 |
| 高介電材料 | High-k Dielectric | 傳遞電場能力（介電常數 k）比二氧化矽高很多的絕緣材料，牆可以做厚 | hk3 |
| 二氧化鉿 | Hafnium Dioxide (HfO₂) | 業界取代二氧化矽的高介電材料 | hk3 |
| 等效氧化層厚度 | Equivalent Oxide Thickness (EOT) | 把高介電牆換算成「要多薄的二氧化矽，才有同樣的控制力」 | hk3 |
| 高介電金屬閘極 | High-k Metal Gate (HKMG) | 絕緣層換成高介電材料、閘極從多晶矽換成金屬，這兩個改變的合稱 | hk4 |
| 功函數金屬 | Work Function Metal | 貼在高介電層上面的金屬，決定電晶體要多大電壓才打開 | hk4 |
| 臨界電壓 | Threshold Voltage (Vt) | 電晶體開始打開所需要的閘極電壓 | hk4 |
| 後閘極 | Replacement Metal Gate (RMG) | 先用耐高溫的假閘極佔位，源汲極做完、加熱完再換成高介電層和金屬 | hk4 |
| 微影 | Lithography | 用光把光罩上的電路圖案印到晶圓表面光阻上的步驟 | litho1 |
| 光阻 | Photoresist | 塗在晶圓上、照到光會變質的感光膠，像相機底片 | litho1 |
| 光罩 | Photomask | 刻著電路圖案的「底片」，光穿過或反射後把圖案印到晶圓上 | litho1 |
| 半間距 | Half Pitch | 相鄰兩條線中心距離的一半，用來說「能畫多細」 | litho1 |
| 深紫外光 | Deep Ultraviolet (DUV) | 波長 193 nm 的光，浸潤式一次曝光可畫到約 40 nm 半間距 | litho1 |
| 極紫外光 | Extreme Ultraviolet (EUV) | 波長 13.5 nm 的光，5 nm 以後最細圖層的主力 | litho1 |
| 曝光區 | Exposure Field | 曝光機一次能印的範圍，一般是 26 × 33 mm，整片晶圓一格一格印 | field |
| 數值孔徑 | Numerical Aperture (NA) | 鏡頭收光的角度，越大能畫的線越細 | reso |
| 繞射 | Diffraction | 光遇到接近波長大小的開口會往兩旁散開，讓線變寬、變淡 | litho2 |
| 隨機缺陷 | Stochastic Defect | EUV 光子太少、分布不均，某些洞剛好收光不足而印不開 | litho4 |
| 多重曝光 | Multiple Patterning | 線太密時把圖案拆到兩張以上光罩、分次曝光再合起來 | mpat |
| 光學鄰近修正 | Optical Proximity Correction (OPC) | 先把光罩圖形故意修正，抵銷光暈開造成的變形 | litho6 |
| 量測 | Metrology | 製程中量尺寸（線寬、膜厚、疊對），回答「做得對不對」 | eyes |
| 檢測 | Inspection | 製程中掃描整片晶圓找缺陷（微粒、刮痕、短路），回答「哪裡有缺陷」 | eyes |
| 晶圓允收測試 | Wafer Acceptance Test (WAT) | 晶圓做完後扎切割道上的測試結構量電性，決定放行或扣住 | eyes |
| 切割道 | Scribe Line | 晶粒之間的走道，切割時會被切掉，上面放量測靶和測試結構 | eyes |
| 關鍵尺寸 | Critical Dimension (CD) | 量測最常量的尺寸，例如線寬 | metro |
| 穿透式電子顯微鏡 | Transmission Electron Microscope (TEM) | 讓電子穿過超薄切片成像，看得到原子但會破壞樣品，是其他量測的參考 | metro |
| 掃描式電子顯微鏡 | Scanning Electron Microscope (SEM) | 用電子束從上方掃描表面；產線量線寬用的是 CD-SEM | metro |
| 光學散射量測 | Optical Critical Dimension (OCD) | 打光到週期性量測靶、量反射光譜，再用模型反推 3D 形狀 | metro |
| 統計製程管制 | Statistical Process Control (SPC) | 用管制圖判定機台有沒有變、這批要怎麼處理 | mloop |
| 管制線 | Control Limit | 依機台平常的變異（通常 ±3σ）算出的線，超出代表機台變了，比規格嚴 | mloop |
| 先進製程控制 | Advanced Process Control (APC) | 依量測結果自動算出下一批要調多少 | apc |
