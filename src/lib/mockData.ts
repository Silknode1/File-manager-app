/**
 * Mock data for development in browser (outside Tauri)
 * Provides realistic sample data for all visualizations and UI components
 */

import type { DuplicateGroup, ScanProgress, ScanResults } from "../types";

export function generateMockProgress(phase: number): ScanProgress {
  const phases = [
    "Discovery",
    "Filtering",
    "Prehashing",
    "Hashing",
    "Grouping",
    "Complete",
  ] as const;

  const currentPhase = phases[Math.min(phase, phases.length - 1)];
  const discovered = Math.min(phase * 3500 + Math.random() * 500, 15000);
  const filtered = Math.floor(discovered * 0.08);

  return {
    phase: currentPhase,
    total_files_discovered: Math.floor(discovered),
    files_filtered: filtered,
    files_prehashed: Math.floor(Math.max(0, discovered - filtered) * Math.min(phase / 3, 1)),
    files_hashed: Math.floor(Math.max(0, discovered - filtered) * Math.min((phase - 2) / 2, 1)),
    files_grouped: phase >= 4 ? Math.floor(discovered * 0.15) : 0,
    bytes_processed: Math.floor(discovered * 125000 * Math.min(phase / 4, 1)),
    total_bytes: Math.floor(discovered * 125000),
    current_path: `/Users/demo/Documents/Projects/file_${Math.floor(Math.random() * 1000)}.ts`,
    elapsed_ms: phase * 2500 + Math.floor(Math.random() * 1000),
    estimated_remaining_ms: phase < 5 ? (5 - phase) * 3000 : null,
    files_per_second: 850 + Math.random() * 200,
    bytes_per_second: 106250000 + Math.random() * 25000000,
    extension_counts: {
      jpg: Math.floor(2800 + Math.random() * 200),
      png: Math.floor(1500 + Math.random() * 100),
      pdf: Math.floor(900 + Math.random() * 50),
      mp4: Math.floor(350 + Math.random() * 30),
      ts: Math.floor(2100 + Math.random() * 100),
      js: Math.floor(1800 + Math.random() * 100),
      json: Math.floor(600 + Math.random() * 50),
      md: Math.floor(400 + Math.random() * 30),
      css: Math.floor(550 + Math.random() * 40),
      html: Math.floor(300 + Math.random() * 20),
      py: Math.floor(700 + Math.random() * 50),
      rs: Math.floor(250 + Math.random() * 20),
      svg: Math.floor(450 + Math.random() * 30),
      mp3: Math.floor(280 + Math.random() * 20),
      zip: Math.floor(120 + Math.random() * 10),
    },
    extension_sizes: {
      jpg: Math.floor(450000000 + Math.random() * 50000000),
      png: Math.floor(280000000 + Math.random() * 30000000),
      pdf: Math.floor(350000000 + Math.random() * 40000000),
      mp4: Math.floor(1800000000 + Math.random() * 200000000),
      ts: Math.floor(45000000 + Math.random() * 5000000),
      js: Math.floor(38000000 + Math.random() * 4000000),
      json: Math.floor(12000000 + Math.random() * 2000000),
      md: Math.floor(8000000 + Math.random() * 1000000),
      css: Math.floor(15000000 + Math.random() * 2000000),
      html: Math.floor(9000000 + Math.random() * 1000000),
      py: Math.floor(22000000 + Math.random() * 3000000),
      rs: Math.floor(18000000 + Math.random() * 2000000),
      svg: Math.floor(32000000 + Math.random() * 3000000),
      mp3: Math.floor(560000000 + Math.random() * 60000000),
      zip: Math.floor(480000000 + Math.random() * 50000000),
    },
    size_distribution: {
      tiny: Math.floor(3200 + Math.random() * 300),
      small: Math.floor(4500 + Math.random() * 400),
      medium: Math.floor(3800 + Math.random() * 300),
      large: Math.floor(2100 + Math.random() * 200),
      huge: Math.floor(800 + Math.random() * 80),
      massive: Math.floor(45 + Math.random() * 10),
    },
    is_complete: phase >= 5,
    is_cancelled: false,
    errors: [],
  };
}

function mockFile(
  name: string,
  ext: string,
  size: number,
  path: string
) {
  return {
    id: `file-${Math.random().toString(36).slice(2, 10)}`,
    path,
    name,
    extension: ext,
    size,
    modified: new Date(Date.now() - Math.random() * 365 * 86400000).toISOString(),
    created: new Date(Date.now() - Math.random() * 730 * 86400000).toISOString(),
    mime_type: ext === "jpg" ? "image/jpeg" : ext === "png" ? "image/png" : "application/octet-stream",
    prehash: `prehash-${Math.random().toString(36).slice(2)}`,
    full_hash: `hash-${Math.random().toString(36).slice(2)}`,
    is_symlink: false,
  };
}

export function generateMockResults(): ScanResults {
  const groups: DuplicateGroup[] = [
    {
      id: "group-1",
      hash: "abc123def456",
      files: [
        mockFile("vacation_photo.jpg", "jpg", 4500000, "/Users/demo/Photos/vacation_photo.jpg"),
        mockFile("vacation_photo (1).jpg", "jpg", 4500000, "/Users/demo/Downloads/vacation_photo (1).jpg"),
        mockFile("vacation_photo_copy.jpg", "jpg", 4500000, "/Users/demo/Desktop/vacation_photo_copy.jpg"),
      ],
      file_count: 3,
      total_size: 13500000,
      wasted_size: 9000000,
      extension: "jpg",
      mime_type: "image/jpeg",
    },
    {
      id: "group-2",
      hash: "def789ghi012",
      files: [
        mockFile("presentation.pdf", "pdf", 12000000, "/Users/demo/Documents/Work/presentation.pdf"),
        mockFile("presentation_v2.pdf", "pdf", 12000000, "/Users/demo/Documents/Archive/presentation_v2.pdf"),
      ],
      file_count: 2,
      total_size: 24000000,
      wasted_size: 12000000,
      extension: "pdf",
      mime_type: "application/pdf",
    },
    {
      id: "group-3",
      hash: "xyz345uvw678",
      files: [
        mockFile("song.mp3", "mp3", 8500000, "/Users/demo/Music/song.mp3"),
        mockFile("song_backup.mp3", "mp3", 8500000, "/Users/demo/Music/Backup/song_backup.mp3"),
        mockFile("song_old.mp3", "mp3", 8500000, "/Users/demo/Downloads/song_old.mp3"),
        mockFile("song (2).mp3", "mp3", 8500000, "/Users/demo/Desktop/song (2).mp3"),
      ],
      file_count: 4,
      total_size: 34000000,
      wasted_size: 25500000,
      extension: "mp3",
      mime_type: "audio/mpeg",
    },
    {
      id: "group-4",
      hash: "mno901pqr234",
      files: [
        mockFile("logo.png", "png", 250000, "/Users/demo/Projects/website/public/logo.png"),
        mockFile("logo.png", "png", 250000, "/Users/demo/Projects/app/assets/logo.png"),
      ],
      file_count: 2,
      total_size: 500000,
      wasted_size: 250000,
      extension: "png",
      mime_type: "image/png",
    },
    {
      id: "group-5",
      hash: "stu567vwx890",
      files: [
        mockFile("project.zip", "zip", 45000000, "/Users/demo/Downloads/project.zip"),
        mockFile("project_backup.zip", "zip", 45000000, "/Users/demo/Documents/Backups/project_backup.zip"),
      ],
      file_count: 2,
      total_size: 90000000,
      wasted_size: 45000000,
      extension: "zip",
      mime_type: "application/zip",
    },
  ];

  return {
    scan_id: "mock-scan-001",
    duplicate_groups: groups,
    unique_files: Array.from({ length: 50 }, (_, i) =>
      mockFile(
        `unique_file_${i}.txt`,
        "txt",
        Math.floor(Math.random() * 100000),
        `/Users/demo/Documents/unique_file_${i}.txt`
      )
    ),
    total_files_scanned: 14532,
    total_duplicates: 13,
    total_groups: 5,
    total_size: 3250000000,
    total_wasted_size: 91750000,
    extension_breakdown: {
      jpg: { extension: "jpg", total_files: 2800, duplicate_files: 3, total_size: 450000000, wasted_size: 9000000 },
      png: { extension: "png", total_files: 1500, duplicate_files: 2, total_size: 280000000, wasted_size: 250000 },
      pdf: { extension: "pdf", total_files: 900, duplicate_files: 2, total_size: 350000000, wasted_size: 12000000 },
      mp3: { extension: "mp3", total_files: 280, duplicate_files: 4, total_size: 560000000, wasted_size: 25500000 },
      mp4: { extension: "mp4", total_files: 350, duplicate_files: 0, total_size: 1800000000, wasted_size: 0 },
      zip: { extension: "zip", total_files: 120, duplicate_files: 2, total_size: 480000000, wasted_size: 45000000 },
      ts: { extension: "ts", total_files: 2100, duplicate_files: 0, total_size: 45000000, wasted_size: 0 },
      js: { extension: "js", total_files: 1800, duplicate_files: 0, total_size: 38000000, wasted_size: 0 },
    },
  };
}
