# 頁序

簡報的頁面清單：由上到下就是播放順序。頁面寫在 deck/<部分>/<章>.md（寫法見 framework/guide/deck.md），加進這裡才會播放。
有對應小節的頁寫成「- 頁id@頁的指紋 → 小節@指紋, 小節@指紋」：哪一邊改了，檢查程式就點名另一邊要重看。指紋由 check.py --fp 產生，人不用手改。
章節列這份簡報自己編排（第二部分的十章）；沒寫的話會照簡報章檔的「# 章名」自動產生。

## 設定
- 標題：先進製程技術演進
- 浮水印：個人整理的教育用簡報，非任何公司官方資料，不代表任何公司（含作者任職單位）之立場；內容依公開資料整理，不含公司非公開資訊

## 部分
- 0：開場
- 1：第一部分 · 演進與現況
- 2：第二部分 · 製造：從電晶體到量產（十章）
- 3：第三部分 · 突破摩爾定律
- 4：台積電篇
- 9：結尾

## 章節列
- 1：微影 → litho1
- 2：蝕刻 → etch1
- 3：沉積 → depo4
- 4：摻雜磊晶 → dope1
- 5：閘極 → hk1
- 6：平坦化 → cmp1
- 7：環繞式 → gaaflow
- 8：模擬 → tcad1
- 9：檢測量測 → eyes
- 10：設計到量產 → d2m

## 頁面
- cover
- agenda
- scale
- p1
- parts
- mosfet
- nfetpfet
- sce
- struct3d
- gatectl
- nodename
- timeline
- fabs
- cost
- p1sum
- p2
- loop
- litho1@34f751 → litho1@570fa3, field@8fc9c4, reso@09ee2b
- lithoL@349a6b → litho2@6b2f76
- litho3@9e2a91 → litho3@f30d0e
- litho3m@42065b → litho3m@cdaa31
- litho4@f8fd2a → litho4@a6d85f
- litho5@d92432 → reso@09ee2b, mpat@abebb2, litho5@373146
- litho6@4e4073 → litho6@310844
- cmask@c5975a → cmask@1690c6
- etch1
- etch3
- etch4
- depo4
- depo1
- depo2
- asd
- dope1
- depo3
- dope3
- hk1@f0cc3a → hk1@4c046b, hk2@b86b6a, hk3@e3a45c, hk4@9e6156
- cmp1
- cmp2
- cmp3
- gaaflow
- fmb
- mol
- beol
- beol2
- tcad1
- tcad2
- eyes@fe5310 → eyes@c620d0
- metro@3ac731 → metro@f1c701
- tem@424560 → tem@87f1a2
- sem@d499c2 → sem@c64f55
- ocd@c8420c → ocd@7654cc
- ocdf@5e0141 → ocdf@c5ecf0
- ocdb@edcf35 → ocdb@efd008
- insp@a6ca6b → insp@88dbf5
- mloop@2b5e95 → mloop@31c782
- apc@a8207b → apc@26198a
- wat@d5c254 → wat@15f0a1
- wat2@3495a7 → wat2@8751e6
- wat4@afc5b9 → wat4@4f7223
- d2m
- pdk
- npi
- a14case
- yield
- p2sum
- p3
- pkg0
- pkg
- pkg2
- cowcmp
- glass
- pkg4
- pkg4b
- pkg3
- soic
- therm3d
- therm3d2
- dt3d
- opt1
- cpo
- bsx
- bs3
- bs2
- bsheat
- bs4
- cfet
- roadmap
- summary
- refs
- qa
