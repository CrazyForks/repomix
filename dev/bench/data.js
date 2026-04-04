window.BENCHMARK_DATA = {
  "lastUpdate": 1775315301498,
  "repoUrl": "https://github.com/CrazyForks/repomix",
  "entries": {
    "Repomix Performance": [
      {
        "commit": {
          "author": {
            "email": "koukun0120@gmail.com",
            "name": "Kazuki Yamada",
            "username": "yamadashy"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9d6e224a94df25c1bd06b23455296a70561266d8",
          "message": "Merge pull request #1356 from yamadashy/perf/cache-empty-dir-paths\n\nperf(core): Cache empty directory paths to avoid redundant file search",
          "timestamp": "2026-04-02T00:26:39+09:00",
          "tree_id": "9f39d41e3bdcf3870204b7a48ffc12e284484cde",
          "url": "https://github.com/CrazyForks/repomix/commit/9d6e224a94df25c1bd06b23455296a70561266d8"
        },
        "date": 1775315300641,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "Repomix Pack (macOS)",
            "value": 1766,
            "range": "±219",
            "unit": "ms",
            "extra": "Median of 30 runs\nQ1: 1651ms, Q3: 1870ms\nAll times: 1372, 1390, 1500, 1513, 1520, 1569, 1633, 1651, 1653, 1703, 1731, 1734, 1740, 1753, 1758, 1766, 1789, 1792, 1793, 1809, 1826, 1849, 1870, 1884, 1885, 1905, 1982, 1993, 2071, 2109ms"
          },
          {
            "name": "Repomix Pack (Linux)",
            "value": 2244,
            "range": "±24",
            "unit": "ms",
            "extra": "Median of 20 runs\nQ1: 2231ms, Q3: 2255ms\nAll times: 2221, 2225, 2226, 2226, 2229, 2231, 2238, 2240, 2244, 2244, 2244, 2247, 2247, 2248, 2249, 2255, 2256, 2257, 2264, 2266ms"
          },
          {
            "name": "Repomix Pack (Windows)",
            "value": 2651,
            "range": "±15",
            "unit": "ms",
            "extra": "Median of 20 runs\nQ1: 2644ms, Q3: 2659ms\nAll times: 2622, 2628, 2628, 2629, 2641, 2644, 2646, 2648, 2649, 2650, 2651, 2651, 2652, 2656, 2657, 2659, 2672, 2696, 2702, 2731ms"
          }
        ]
      }
    ]
  }
}