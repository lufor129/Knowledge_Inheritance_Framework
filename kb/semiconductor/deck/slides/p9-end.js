/* 結尾：參考資料與圖片來源 */
(function () {
  // [說明, 網址]；存取日期皆為 2026/09
  const REFS = [
    ['TSMC 2026 技術論壇新聞稿：A13、A12、N2U 路線圖', 'https://pr.tsmc.com/english/news/3302'],
    ['TrendForce（2026/04）：A16 延至 2027、A12/A13 2029', 'https://www.trendforce.com/news/2026/04/23/news-tsmc-unveils-latest-roadmap-a12-a13-set-for-2029-without-high-na-euv-a16-volume-production-delayed-to-2027/'],
        ['Bits&Chips：Intel 14A 關鍵圖層採用 High-NA', 'https://bits-chips.com/article/intel-confirms-high-na-euv-deployment-for-14a-node/'],
    ['Wccftech：Intel 14A 2027 試產、2028 量產', 'https://wccftech.com/intel-14a-enters-high-volume-production-2028-as-risk-production-moved-ahead-to-2027/'],
    ['SemiEngineering（VLSI 2026）：Intel 18A PowerVia 壓降改善約 10 倍', 'https://semiengineering.com/vlsi-2026-intel-18a-platform-momentum-from-devices-to-routed-designs/'],
    ['Tom’s Hardware（引 TechInsights）：N2 約 313、18A 約 238、SF2 約 231 百萬個／mm²', 'https://www.tomshardware.com/tech-industry/intels-18a-and-tsmcs-n2-process-nodes-compared-intel-is-faster-but-tsmc-is-denser'],
    ['WikiChip Fuse：TSMC N3E 高密度單元約 216 百萬個／mm²', 'https://fuse.wikichip.org/news/7375/tsmc-n3-and-challenges-ahead/'],
    ['TSMC A16／A14 技術頁：密度比較', 'https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_A16'],
    ['ASML NXE:3800E 產品頁（220 片/小時）', 'https://www.asml.com/en/products/euv-lithography-systems/twinscan-nxe-3800e'],
    ['NVIDIA：台積電與 Synopsys 將 cuLitho 導入生產（GPU 運算微影）', 'https://nvidianews.nvidia.com/news/tsmc-synopsys-nvidia-culitho'],
    ['NVIDIA：Spectrum-X／Quantum-X CPO 交換器', 'https://nvidianews.nvidia.com/news/nvidia-spectrum-x-co-packaged-optics-networking-switches-ai-factories'],
    ['TSMC 3DFabric：CoWoS-S／R／L', 'https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm'],
    ['Intel 2026 Q2 法說（XenoSpectrum 整理）：EMIB-T 2027 年客戶量產', 'https://xenospectrum.com/en/intel-emib-t-2027-volume-ramp/'],
        ['Tom’s Hardware：玻璃基板路線圖（約 2030 年前後導入）', 'https://tomshardware.com/tech-industry/manufacturing/glass-substrate-roadmap-examined'],
    ['TrendForce（2026/04）：台積電 CoPoS 試產線', 'https://www.trendforce.com/news/2026/04/13/news-tsmc-advances-panel-level-packaging-copos-pilot-line-reportedly-set-for-june-completion-2028-29-ramp-eyed/'],
    ['TrendForce（2026/05）：310 mm 面板級封裝進展', 'https://www.trendforce.com/news/2026/05/19/news-equipment-maker-schmid-flags-tsmc-panel-level-packaging-push-310x310mm-progress-glass-integration-under-review/'],
    ['imec：CFET 與 2D 材料邏輯路線圖', 'https://www.imec-int.com'],
    ['TechNode（2025/10）：2 奈米晶圓約三萬美元（業界估計）', 'https://technode.com/2025/10/09/tsmc-sets-2nm-wafer-price-at-30000-far-below-earlier-50-increase-speculation/'],
    ['Broadcom：Tomahawk 6 Davisson 102.4T CPO 交換器', 'https://news.broadcom.com/releases/broadcom-announces-tomahawk-6-davisson-the-industrys-first-102-4-tbps-ethernet-switch-with-co-packaged-optics'],
    ['TrendForce（2026/01）：SK 海力士 HBM4 16 層續用 MR-MUF', 'https://www.trendforce.com/news/2026/01/13/news-sk-hynix-may-stick-with-mr-muf-for-hbm4-16-high-despite-asmpt-tc-bonder-orders/'],
    ['SemiWiki：TSMC Super Power Rail (SPR)', 'https://semiwiki.com/wikis/industry-wikis/tsmc-super-power-rail-spr-wiki/'],
    ['TSMC CyberShuttle 共乘下線（MPW）服務', 'https://www.tsmc.com/english/dedicatedFoundry/services/cyberShuttle'],
    ['Synopsys（2015）：PDK V0.9／V1.0 版本命名例', 'https://news.synopsys.com/2015-09-17-TSMC-Certifies-Synopsys-Design-Tools-for-10-nm-FinFET-Technology']
  ];
  Deck.add({
    id: 'refs', part: 9, minutes: 0.5, short: '參考資料與圖片來源',
    title: '參考資料與圖片來源', en: 'References & Credits',
    thesis: '產業資料整理至 2026 年 9 月；成本與密度等數字為業界估計，動畫為示意。',
    render: () => `<div class="s-body w50">
      <div class="col" style="min-height:0;overflow:auto"><div class="fig-title"><span>產業與技術資料</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;font-size:12.5px;line-height:1.25">${REFS.map(([t, u]) => `<div style="border-bottom:1px solid var(--line);padding:2px 0">${t}<div class="mono" style="color:var(--ink-3);font-size:10px;word-break:break-all">${u}</div></div>`).join('')}</div>
        <p class="gloss" style="margin:0">網址存取日期：2026 年 9 月</p></div>
      <div class="col" style="min-height:0;overflow:auto"><div class="fig-title"><span>照片與顯微影像</span></div>
        <table class="t" style="font-size:12.5px;line-height:1.2"><tbody>${Object.values(CREDITS).map(c => `<tr><td style="padding:1px 6px">${c.t} · <span style="color:var(--ink-3)">${c.by}</span>${c.url ? `<div class="mono" style="color:var(--ink-3);font-size:10px;word-break:break-all">${c.url}</div>` : ''}</td><td style="white-space:nowrap;padding:1px 6px">${c.licUrl ? `<a href="${c.licUrl}" target="_blank" rel="noopener noreferrer">${c.lic}</a>` : c.lic}</td></tr>`).join('')}</tbody></table>
        <p class="gloss" style="margin:0">標「縮圖」「裁切」的為本簡報修改過的版本；其餘圖解、動畫與 3D 模型皆為本簡報自行繪製。</p></div>
    </div>`,
    notes: `最後一頁是參考資料和圖片來源。產業資料整理到 2026 年 9 月，路線圖隨時可能變動；成本、密度等數字是業界估計；動畫是為了幫助理解的示意，不是精確的模擬。謝謝大家，歡迎提問。`
  });
})();
