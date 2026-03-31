import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, RadarChart, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarAngleAxis, PolarGrid, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, TrendingUp, TrendingDown, ArrowRight, Users, Package, Zap, Globe, DollarSign, FileText, Calendar, Download } from 'lucide-react';

// ============================================
// DATA CONSTANTS
// ============================================

const REGIONS = [
  { key: 'global', label: 'Global', color: '#3b82f6' },
  { key: 'na', label: 'North America', color: '#ef4444' },
  { key: 'we', label: 'Western Europe', color: '#10b981' },
  { key: 'hg', label: 'High-Growth', color: '#f59e0b' },
  { key: 'od', label: 'Other Dev.', color: '#8b5cf6' },
];

const CATEGORIES = ['Extraction', 'Library Prep', 'Automation', 'Sequencing', 'Analysis', 'Reporting'];

const INDICATIONS = [
  { key: "solid_tumor", label: "Solid Tumor", icon: "🎯", color: "#ef4444" },
  { key: "liquid_biopsy", label: "Liquid Biopsy", icon: "🩸", color: "#f97316" },
  { key: "hereditary_cancer", label: "Hereditary Cancer", icon: "🧬", color: "#a855f7" },
  { key: "heme_malig", label: "Heme Malignancies", icon: "🔬", color: "#ec4899" },
  { key: "rare_disease", label: "Rare Disease", icon: "🔍", color: "#14b8a6" },
  { key: "pharmacogenomics", label: "Pharmacogenomics", icon: "💊", color: "#6366f1" },
  { key: "hla_typing", label: "HLA Typing", icon: "🏥", color: "#0ea5e9" },
  { key: "infectious_disease", label: "Infectious Disease", icon: "🦠", color: "#84cc16" },
];

const VENDORS = [
  { key: 'illumina', label: 'Illumina', color: '#3b82f6', strength: 'Sequencing dominance + integrated workflows', weakness: 'Premium pricing, closed ecosystem', recentMove: 'DRAGEN on-instrument, XLEAP-SBS chemistry' },
  { key: 'roche', label: 'Roche', color: '#ef4444', strength: 'KAPA workhorse + MagNA Pure IVD extraction', weakness: 'SBX sequencer pre-clinical, KAPA commodity pressure', recentMove: 'Axelios 1 SBX sequencer launch ($150 genome), AVENIO ctDNA updates' },
  { key: 'thermo', label: 'Thermo Fisher', color: '#10b981', strength: 'Genexus sample-to-report + AmpliSeq catalog', weakness: 'Semiconductor throughput ceiling', recentMove: 'Oncomine Precision Assay, Genexus system' },
  { key: 'qiagen', label: 'Qiagen', color: '#f59e0b', strength: 'Gold standard extraction + QCI Interpret', weakness: 'No sequencing platform', recentMove: 'QCI AI enhancements, QIAseq UMI panels' },
  { key: 'agilent', label: 'Agilent', color: '#8b5cf6', strength: 'SureSelect probe quality + SureDesign custom portal', weakness: 'No sequencing platform, Bravo aging', recentMove: 'SureSelect XT HS2, Cancer All-In-One' },
  { key: 'twist', label: 'Twist Bioscience', color: '#06b6d4', strength: 'Silicon synthesis uniformity + fast 2h hyb', weakness: 'No IVD-marked panels', recentMove: 'Exome 2.0, Element Biosciences partnership' },
  { key: 'idt', label: 'IDT (Danaher)', color: '#ec4899', strength: 'xGen probe QC + Swift Biosciences', weakness: 'Brand fragmentation', recentMove: 'Swift Accel expansion, xGen UMI panels' },
  { key: 'archerdx', label: 'ArcherDX (IDT/Danaher)', color: '#f43f5e', strength: 'Anchored Multiplex PCR (AMP) technology, fusion detection leader', weakness: 'Post-acquisition integration, narrower panel scope vs TSO500', recentMove: 'FusionPlex-HT/VariantPlex-HT automation-ready, IDT integration' },
  { key: 'neb', label: 'New England Biolabs', color: '#84cc16', strength: 'Enzyme quality/purity, Ultra II FS low-input', weakness: 'No enrichment panels, limited clinical IVD', recentMove: 'UMI adapter expansion, EM-seq launch' },
  { key: 'beckman', label: 'Beckman Coulter (Danaher)', color: '#a855f7', strength: 'AMPure XP universal adoption, Biomek installed base', weakness: 'Biomek aging vs Hamilton', recentMove: 'Biomek i-Series refresh' },
  { key: 'promega', label: 'Promega', color: '#d946ef', strength: 'Maxwell RSC walkaway extraction', weakness: 'No library prep/sequencing portfolio', recentMove: 'Maxwell RSC 48, cfDNA optimization' },
  { key: 'takara', label: 'Takara Bio', color: '#0891b2', strength: 'SMART tech ultra-low RNA input, single-cell', weakness: 'Smaller NA/EU clinical presence', recentMove: 'SMARTer Pico v3 FFPE, spatial transcriptomics' },
  { key: 'revvity', label: 'Revvity (fka PerkinElmer)', color: '#7c3aed', strength: 'NEXTFLEX kits + Sciclone/Janus automation', weakness: 'NGS small % of revenue, automation aging', recentMove: 'Revvity rebrand, NEXTFLEX UDI expansion' },
  { key: 'paragon', label: 'Paragon Genomics', color: '#fb923c', strength: 'CleanPlex background-cleaning tech, ultra-low 1ng input', weakness: 'Small company, no IVD products', recentMove: 'OncoZoom panel, MGI-compatible kits' },
  { key: 'pillar', label: 'Pillar Biosciences', color: '#14b8a6', strength: 'SLIMamp proprietary multiplex PCR, 500+ gene panel', weakness: 'Pre-FDA approval, small commercial team', recentMove: 'oncoReveal v2, FDA Breakthrough designation' },
  { key: 'sophia', label: 'SOPHiA Genetics', color: '#6366f1', strength: '1,000+ hospital network, panel + DDM analysis bundle', weakness: 'Revenue growth slowing, US penetration limited', recentMove: 'DDM AI enhancements, biopharma expansion' },
  { key: 'invivoscribe', label: 'InvivoScribe', color: '#be185d', strength: 'LymphoTrack heme malig leader, CE-IVD portfolio', weakness: 'Narrow indication focus (heme only)', recentMove: 'LymphoTrack updates, myeloid panel development' },
  { key: 'watchmaker', label: 'Watchmaker Genomics', color: '#65a30d', strength: 'Fast enzymatic workflows, Polaris rRNA depletion', weakness: 'Newer entrant, limited clinical validation', recentMove: 'Revvity automation partnership, Element collaboration' },
  { key: 'mgi', label: 'MGI Tech (BGI)', color: '#0ea5e9', strength: 'DNBSEQ lowest cost per Gb, dominant in China', weakness: 'Limited US access, geopolitical headwinds', recentMove: 'US re-entry, DNBSEQ-G99 benchtop' },
  { key: 'guardant', label: 'Guardant Health', color: '#fbbf24', strength: 'Guardant360 CDx market leader liquid biopsy', weakness: 'Service model only (no kit sales)', recentMove: 'Guardant360 CDx expanded indications, Shield CRC screening' },
  { key: 'foundation', label: 'Foundation Medicine (Roche)', color: '#dc2626', strength: 'FoundationOne CDx gold standard CGP', weakness: 'Service model only, Roche dependency', recentMove: 'FoundationOne Liquid CDx expansion, CDx approvals' },
  { key: 'tempus', label: 'Tempus AI', color: '#ea580c', strength: 'AI-driven genomics, 595-gene xT panel', weakness: 'Service model, profitability challenges', recentMove: 'IPO 2024, expanded multi-omic testing' },
  { key: 'caris', label: 'Caris Life Sciences', color: '#4f46e5', strength: 'MI Profile 650+ genes, WES/WTS combined', weakness: 'Service model only', recentMove: 'MI Profile expanded, WGS offering' },
  { key: 'hamilton', label: 'Hamilton', color: '#78716c', strength: 'STAR gold standard automation', weakness: 'Premium pricing, complex programming', recentMove: 'Method library expansion, LIMS integration' },
  { key: 'tecan', label: 'Tecan', color: '#059669', strength: 'Fluent dynamic deck, strong European presence', weakness: 'Smaller NGS method library', recentMove: 'Fluent cloud connectors, SiLA 2 compliance' },
  { key: 'opentrons', label: 'Opentrons', color: '#2563eb', strength: 'Open-source Python API, $25-70k price point', weakness: 'Lower precision vs Hamilton, not IVD validated', recentMove: 'Flex launch, 96-channel head' },
  { key: 'nvidia', label: 'NVIDIA', color: '#16a34a', strength: 'GPU acceleration (22min 30x WGS)', weakness: 'Niche focus for huge company', recentMove: 'Parabricks 4.x, BioNeMo AI' },
  { key: 'broad', label: 'Broad Institute', color: '#9333ea', strength: 'GATK/BWA standard, academic leadership', weakness: 'Non-profit, no commercial support', recentMove: 'GATK 4.x, BWA-MEM2' },
  { key: 'philips', label: 'Philips', color: '#0284c7', strength: 'Health IT ecosystem integration', weakness: 'NGS tiny fraction of revenue', recentMove: 'IntelliSpace Genomics updates' },
  { key: 'saphetor', label: 'Saphetor (VarSome)', color: '#d97706', strength: '150+ database aggregation, free tier adoption', weakness: 'Small company, limited somatic depth', recentMove: 'VarSome Clinical AMP tiering' },
  { key: 'velsera', label: 'Velsera', color: '#b91c1c', strength: 'Full FASTQ-to-report (Seven Bridges + Pierian)', weakness: 'Brand confusion from mergers', recentMove: 'Platform unification, Francisco Partners backing' },
  { key: 'fabric', label: 'Fabric Genomics', color: '#ca8a04', strength: 'GEM AI scoring pioneer', weakness: 'Small company, germline-focused', recentMove: 'Somatic workflow addition' },
  { key: 'clearlabs', label: 'Clear Labs', color: '#0d9488', strength: 'Fully integrated sample-to-answer', weakness: 'Limited assay menu', recentMove: 'Clear Dx oncology expansion' },
  { key: 'biorad', label: 'Bio-Rad', color: '#7e22ce', strength: 'Droplet digital PCR leader, ddSEQ system', weakness: 'Small NGS footprint', recentMove: 'ddSEQ single-cell solution' },
  { key: 'seqonce', label: 'SeqOnce Biosciences', color: '#475569', strength: 'RapidSeq 2-hour library prep', weakness: 'Very small company, limited panels', recentMove: 'RapidSeq FFPE optimization' },
  { key: 'pacbio', label: 'PacBio', color: '#2dd4bf', strength: 'HiFi long-read accuracy leader, Revio high-throughput', weakness: 'Higher cost per sample for targeted panels, limited IVD', recentMove: 'SPRQ-Nx chemistry 40% cost reduction, Vega benchtop' },
  { key: 'oxford', label: 'Oxford Nanopore', color: '#fb7185', strength: 'Real-time adaptive sampling, ultra-long reads, portable MinION', weakness: 'Higher per-base error rate, limited IVD panels', recentMove: 'PromethION Plus Flow Cell, sub-4hr genome record with Roche' },
  { key: 'element', label: 'Element Biosciences', color: '#c084fc', strength: 'AVITI accuracy + low cost per Gb, benchtop disruptor', weakness: 'Newer entrant, limited installed base, no IVD yet', recentMove: 'AVITI24 5D multiomic platform, Vitari high-throughput announced' },
  { key: 'ultima', label: 'Ultima Genomics', color: '#fcd34d', strength: '$80/genome bulk WGS, flow-based sequencing innovation', weakness: 'Pre-clinical adoption, limited validation data', recentMove: 'UG 200 launch, $80 bulk WGS pricing' },
  { key: 'singular', label: 'Singular Genomics', color: '#a78bfa', strength: 'G4X spatial + sequencing combo, FFPE tissue spatial', weakness: 'Acquired by Deerfield, small commercial footprint', recentMove: 'G4X Spatial Sequencer shipping, FFPE spatial transcriptomics' },
  { key: 'complete_genomics', label: 'Complete Genomics (BGI)', color: '#34d399', strength: 'DNBSEQ-T1+ scalable high-throughput, low cost per genome', weakness: 'US geopolitical concerns, BGI subsidiary', recentMove: 'DNBSEQ-T1+RS US launch, E25 Flash portable sequencer' },
  { key: 'genexus', label: 'Thermo Genexus', color: '#38bdf8', strength: 'Only true sample-to-report automated NGS system', weakness: 'Limited to Ion platform, Oncomine panels only', recentMove: 'Genexus expanded assay menu, Oncomine Precision integration' },
  { key: 'eppendorf', label: 'Eppendorf', color: '#0369a1', strength: 'epMotion intuitive touchscreen, strong academic install base', weakness: 'Limited high-throughput capacity, smaller NGS method library', recentMove: 'epMotion 5075 NGS methods, cloud connectivity' },
  { key: 'spt_labtech', label: 'SPT Labtech', color: '#e879f9', strength: 'firefly all-in-one pipette+dispense, mosquito nanoliter precision', weakness: 'Smaller company, limited clinical validation', recentMove: 'firefly NGS library prep workflows, mosquito HV Genomics' },
];

const PRODUCTS = [
  // EXTRACTION
  { id: 'qiagen-ffpe-ext', vendor: 'qiagen', name: 'QIAamp FFPE DNA', category: 'Extraction', tier: 'A', share: 21, pricing: 8, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:25,we:35,hg:24,od:30}, growth: "stable", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'qiagen-blood-ext', vendor: 'qiagen', name: 'QIAamp Blood', category: 'Extraction', tier: 'A', share: 17, pricing: 5, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:24,we:25,hg:16,od:20}, growth: "stable", indications: ["liquid_biopsy","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'promega-ffpe-ext', vendor: 'promega', name: 'Promega FFPE DNA', category: 'Extraction', tier: 'B', share: 10, pricing: 9, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:10,we:6,hg:7,od:8}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'promega-blood-ext', vendor: 'promega', name: 'Promega Blood DNA', category: 'Extraction', tier: 'B', share: 7, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:7,we:4,hg:3,od:4}, growth: "growing", indications: ["liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'roche-magna-ext', vendor: 'roche', name: 'Roche MagnaP', category: 'Extraction', tier: 'A', share: 19, pricing: 7, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:10,we:18,hg:12,od:16}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'thermo-magmax-ext', vendor: 'thermo', name: 'Thermo MagMAX', category: 'Extraction', tier: 'A', share: 18, pricing: 6, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:18,we:12,hg:14,od:12}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'beckman-ampure-ext', vendor: 'beckman', name: 'Beckman Ampure', category: 'Extraction', tier: 'B', share: 8, pricing: 3, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:6,hg:5,od:6}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },

  // LIBRARY PREP
  { id: 'illumina-dna-prep', vendor: 'illumina', name: 'Illumina DNA Prep', category: 'Library Prep', tier: 'A', share: 5, pricing: 50, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:22,we:18,hg:14,od:16}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'illumina-tso500', vendor: 'illumina', name: 'TSO500', category: 'Library Prep', tier: 'A', share: 4.5, pricing: 315, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:20,we:16,hg:10,od:14}, growth: "growing", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {solid_tumor:{global:16,na:18,we:15,hg:8,od:14},liquid_biopsy:{global:8,na:10,we:8,hg:4,od:6}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"estimated",source:"Channel intelligence",date:"2025-Q1"},regulatory:{level:"verified",source:"FDA 510(k) K201968",date:"2025-12"}} },
  { id: 'illumina-tst170', vendor: 'illumina', name: 'TST170', category: 'Library Prep', tier: 'B', share: 2.5, pricing: 200, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:3,od:5}, growth: "declining", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:4,na:4,we:4,hg:3,od:5}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'illumina-hereditary', vendor: 'illumina', name: 'Illumina Hereditary', category: 'Library Prep', tier: 'A', share: 3.0, pricing: 180, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:14,we:8,hg:3,od:8}, growth: "stable", indications: ["hereditary_cancer"], indicationShare: {hereditary_cancer:{global:10,na:14,we:8,hg:3,od:8}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'illumina-rna-prep', vendor: 'illumina', name: 'Illumina RNA Prep', category: 'Library Prep', tier: 'B', share: 3.0, pricing: 55, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["rna"], regionalShare: {na:10,we:8,hg:5,od:7}, growth: "stable", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'agilent-sureselect', vendor: 'agilent', name: 'SureSelect XT', category: 'Library Prep', tier: 'A', share: 3.0, pricing: 150, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:12,we:16,hg:10,od:14}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {solid_tumor:{global:8,na:7,we:10,hg:7,od:9},rare_disease:{global:12,na:10,we:14,hg:10,od:14}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'twist-panels', vendor: 'twist', name: 'Twist Panels', category: 'Library Prep', tier: 'B', share: 1.5, pricing: 90, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:6,we:5,hg:3,od:4}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'idt-xgen', vendor: 'idt', name: 'IDT xGen', category: 'Library Prep', tier: 'B', share: 2.0, pricing: 85, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:8,we:5,hg:4,od:5}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'kapa-hyperprep', vendor: 'roche', name: 'KAPA HyperPrep', category: 'Library Prep', tier: 'B', share: 2.5, pricing: 40, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:6,we:8,hg:7,od:8}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'neb-ultraii', vendor: 'neb', name: 'NEB Ultra II', category: 'Library Prep', tier: 'B', share: 1.5, pricing: 30, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:6,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'oncomine-dx', vendor: 'thermo', name: 'Oncomine DX', category: 'Library Prep', tier: 'A', share: 3.0, pricing: 250, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:14,we:12,hg:28,od:16}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:18,na:14,we:12,hg:28,od:16}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"estimated",source:"Channel intelligence",date:"2025-Q1"},regulatory:{level:"verified",source:"FDA 510(k)",date:"2025-12"}} },
  { id: 'ion-ampliseq', vendor: 'thermo', name: 'Ion AmpliSeq', category: 'Library Prep', tier: 'B', share: 2.0, pricing: 35, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:7,hg:16,od:10}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","pharmacogenomics","infectious_disease"], indicationShare: {solid_tumor:{global:6,na:5,we:5,hg:12,od:8},pharmacogenomics:{global:15,na:12,we:10,hg:20,od:18}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'roche-avenio', vendor: 'roche', name: 'Avenio Library Prep', category: 'Library Prep', tier: 'B', share: 2.0, pricing: 220, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:8,we:10,hg:3,od:5}, growth: "stable", indications: ["liquid_biopsy"], indicationShare: {liquid_biopsy:{global:10,na:12,we:10,hg:5,od:8}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'qiaseq-panels', vendor: 'qiagen', name: 'QIAseq Panels', category: 'Library Prep', tier: 'B', share: 1.5, pricing: 95, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'archer-fusionplex', vendor: 'archerdx', name: 'Archer FusionPlex (RNA Fusions/Variants)', category: 'Library Prep', tier: 'B', share: 1.5, pricing: 180, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["rna"], regionalShare: {na:5,we:4,hg:2,od:3}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {solid_tumor:{global:6,na:7,we:6,hg:3,od:5},heme_malig:{global:4,na:5,we:4,hg:2,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'archer-variantplex', vendor: 'archerdx', name: 'Archer VariantPlex (DNA Somatic Variants)', category: 'Library Prep', tier: 'B', share: 0.5, pricing: 160, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna"], regionalShare: {na:4,we:3,hg:1,od:2}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {solid_tumor:{global:4,na:5,we:4,hg:2,od:3},heme_malig:{global:3,na:4,we:3,hg:1,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'archer-liquidplex', vendor: 'archerdx', name: 'Archer LiquidPlex (cfDNA Liquid Biopsy)', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 220, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:3,we:2,hg:1,od:1}, growth: "growing", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:4,na:5,we:4,hg:2,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'cleanplex', vendor: 'paragon', name: 'CleanPlex', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 25, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:1}, growth: "growing", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'pillar-oncoreveal', vendor: 'pillar', name: 'Pillar OncoReveal', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 210, regulatory: 'FDA Breakthrough', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:1,hg:3,od:1}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {solid_tumor:{global:3,na:3,we:1,hg:6,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA Breakthrough",date:"2025-12"}} },
  { id: 'sophia-panels', vendor: 'sophia', name: 'Sophia Panels', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 160, regulatory: 'EU EUDAMED', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:4,hg:1,od:2}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {solid_tumor:{global:4,na:1,we:7,hg:2,od:3},heme_malig:{global:5,na:2,we:8,hg:3,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'nextflex', vendor: 'revvity', name: 'NextFlex', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 35, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'takara-smarter', vendor: 'takara', name: 'Takara Smarter', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 55, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:1,od:1}, growth: "stable", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'swift-accel', vendor: 'idt', name: 'Swift Accel', category: 'Library Prep', tier: 'C', share: 1.5, pricing: 60, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "growing", indications: ["solid_tumor"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'invivoscribe-lympho', vendor: 'invivoscribe', name: 'Invivoscribe Lympho', category: 'Library Prep', tier: 'B', share: 1.5, pricing: 200, regulatory: 'EU EUDAMED', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:7,hg:4,od:6}, growth: "stable", indications: ["heme_malig"], indicationShare: {heme_malig:{global:20,na:18,we:25,hg:10,od:22}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },

  // ── ADDITIONAL LIBRARY PREP (EXHAUSTIVE) ──
  { id: 'archer-reveal-ctdna', vendor: 'archerdx', name: 'Archer Reveal ctDNA 28', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 200, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:2,na:3,we:2,hg:1,od:1}}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'archer-fusionplex-ht', vendor: 'archerdx', name: 'Archer FusionPlex-HT (High Throughput)', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 150, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'archer-variantplex-ht', vendor: 'archerdx', name: 'Archer VariantPlex-HT (High Throughput)', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 130, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'illumina-tso500-hrd', vendor: 'illumina', name: 'TruSight Oncology 500 HRD', category: 'Library Prep', tier: 'B', share: 2.5, pricing: 350, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:2}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:4,na:5,we:4,hg:2,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'illumina-tso-comp-eu', vendor: 'illumina', name: 'TruSight Oncology Comprehensive (EU)', category: 'Library Prep', tier: 'B', share: 2.0, pricing: 380, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:3,na:1,we:5,hg:2,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'illumina-ampliseq', vendor: 'illumina', name: 'AmpliSeq for Illumina Panels', category: 'Library Prep', tier: 'B', share: 2.5, pricing: 30, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:2}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","pharmacogenomics","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'thermo-oncomine-precision', vendor: 'thermo', name: 'Oncomine Precision Assay', category: 'Library Prep', tier: 'B', share: 2.0, pricing: 200, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:2}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:4,na:3,we:4,hg:6,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'thermo-ampliseq-hd', vendor: 'thermo', name: 'Ion AmpliSeq HD', category: 'Library Prep', tier: 'B', share: 1.0, pricing: 45, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "stable", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {liquid_biopsy:{global:3,na:3,we:2,hg:4,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'roche-kapa-hypercap', vendor: 'roche', name: 'KAPA HyperCap Workflow', category: 'Library Prep', tier: 'B', share: 2.0, pricing: 120, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'roche-kapa-rna', vendor: 'roche', name: 'KAPA RNA HyperPrep', category: 'Library Prep', tier: 'B', share: 2.0, pricing: 45, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'agilent-sureselect-cre', vendor: 'agilent', name: 'SureSelect Clinical Research Exome V3', category: 'Library Prep', tier: 'B', share: 2.0, pricing: 175, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "stable", indications: ["hereditary_cancer","rare_disease"], indicationShare: {rare_disease:{global:10,na:8,we:12,hg:8,od:12},hereditary_cancer:{global:6,na:5,we:8,hg:5,od:7}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'agilent-sureselect-focused', vendor: 'agilent', name: 'SureSelect Focused Exome', category: 'Library Prep', tier: 'C', share: 2.0, pricing: 130, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'twist-alliance-exome', vendor: 'twist', name: 'Twist Alliance Clinical Research Exome', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 110, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["hereditary_cancer","rare_disease"], indicationShare: {rare_disease:{global:5,na:6,we:5,hg:3,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'twist-cfdna', vendor: 'twist', name: 'Twist cfDNA Pan-Cancer Panel', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 140, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["liquid_biopsy"], indicationShare: {liquid_biopsy:{global:2,na:3,we:2,hg:1,od:1}}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'idt-xgen-prism', vendor: 'idt', name: 'xGen Prism DNA Library Prep', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 35, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'idt-xgen-cfdna', vendor: 'idt', name: 'xGen cfDNA & FFPE DNA Library Prep', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 55, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:2,na:3,we:2,hg:1,od:1}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'qiaseq-methyl', vendor: 'qiagen', name: 'QIAseq Targeted Methyl Panels', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 110, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'sophia-solid-tumor', vendor: 'sophia', name: 'SOPHiA Solid Tumor Solution', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 180, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:1,hg:4,od:1}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:3,na:1,we:5,hg:2,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'sophia-myeloid', vendor: 'sophia', name: 'SOPHiA Myeloid Solution', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 170, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:0,hg:2,od:0}, growth: "emerging", indications: ["heme_malig"], indicationShare: {heme_malig:{global:3,na:1,we:5,hg:2,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'sophia-hereditary', vendor: 'sophia', name: 'SOPHiA Hereditary Cancer Solution', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 155, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:0,hg:2,od:0}, growth: "emerging", indications: ["hereditary_cancer"], indicationShare: {hereditary_cancer:{global:2,na:1,we:4,hg:1,od:1}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'watchmaker-dna', vendor: 'watchmaker', name: 'Watchmaker DNA Library Prep Kit', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 25, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'watchmaker-rna-polaris', vendor: 'watchmaker', name: 'Watchmaker RNA Prep + Polaris Depletion', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 40, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'neb-nebnext-direct', vendor: 'neb', name: 'NEBNext Direct Targeted Panels', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 75, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'biorad-ddseq', vendor: 'biorad', name: 'Bio-Rad ddSEQ Library Prep', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 65, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'seqonce-rapidseq', vendor: 'seqonce', name: 'SeqOnce RapidSeq Library Prep', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 18, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'guardant360-cdx', vendor: 'guardant', name: 'Guardant360 CDx (Service/Panel)', category: 'Library Prep', tier: 'A', share: 3.5, pricing: 5000, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:9,we:7,hg:4,od:6}, growth: "stable", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:22,na:28,we:15,hg:8,od:12}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"verified",source:"Service model",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA PMA P200010",date:"2025-12"}} },
  { id: 'foundation-one-cdx', vendor: 'foundation', name: 'FoundationOne CDx (Service/Panel)', category: 'Library Prep', tier: 'A', share: 4.0, pricing: 3500, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:12,we:9,hg:5,od:8}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:20,na:25,we:14,hg:10,od:15}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"verified",source:"Service model",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA PMA P170019",date:"2025-12"}} },
  { id: 'foundation-liquid-cdx', vendor: 'foundation', name: 'FoundationOne Liquid CDx (Service/Panel)', category: 'Library Prep', tier: 'B', share: 3.0, pricing: 3500, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:2,od:4}, growth: "growing", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:14,na:18,we:10,hg:6,od:8}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"verified",source:"Service model",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA PMA P200016",date:"2025-12"}} },
  { id: 'tempus-xt', vendor: 'tempus', name: 'Tempus xT 595-Gene Panel (Service)', category: 'Library Prep', tier: 'B', share: 3.0, pricing: 3200, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:2,od:4}, growth: "growing", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:8,na:12,we:3,hg:2,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"verified",source:"Service model",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'caris-mi-profile', vendor: 'caris', name: 'Caris MI Profile WES/WTS (Service)', category: 'Library Prep', tier: 'B', share: 2.5, pricing: 4500, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "growing", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:6,na:10,we:2,hg:1,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"verified",source:"Service model",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'mgi-cools-panels', vendor: 'mgi', name: 'MGI CoolMPS Library Prep Panels', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 30, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:1,hg:4,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","infectious_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'pillar-oncoreveal-lung', vendor: 'pillar', name: 'oncoReveal Dx Lung & Colon Cancer Assay', category: 'Library Prep', tier: 'C', share: 1.0, pricing: 190, regulatory: 'FDA Breakthrough', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:2,na:2,we:1,hg:3,od:1}}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA Breakthrough",date:"2025-12"}} },

  // AUTOMATION — Tier A (High-Throughput Production)
  { id: 'Hamilton-ngs', vendor: 'hamilton', name: 'Hamilton Microlab STAR', category: 'Automation', tier: 'A', share: 17, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:19,we:18,hg:12,od:16}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'hamilton-vantage', vendor: 'hamilton', name: 'Hamilton Microlab VANTAGE', category: 'Automation', tier: 'A', share: 8, pricing: 6, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:8,hg:5,od:7}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'tecan-fluent', vendor: 'tecan', name: 'Tecan Fluent', category: 'Automation', tier: 'A', share: 13, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:15,we:14,hg:9,od:12}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'beckman-biomek-i7', vendor: 'beckman', name: 'Beckman Biomek i7', category: 'Automation', tier: 'A', share: 10, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:11,we:10,hg:7,od:9}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  // AUTOMATION — Tier B (Mid-Throughput / Focused NGS)
  { id: 'beckman-biomek-i5', vendor: 'beckman', name: 'Beckman Biomek i5', category: 'Automation', tier: 'B', share: 7, pricing: 4, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'beckman-ngenius', vendor: 'beckman', name: 'Biomek NGeniuS (NGS-Specific)', category: 'Automation', tier: 'B', share: 3, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'agilent-bravo', vendor: 'agilent', name: 'Agilent Bravo NGS', category: 'Automation', tier: 'B', share: 7, pricing: 4, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'revvity-sciclone', vendor: 'revvity', name: 'Revvity Sciclone NGSx iQ', category: 'Automation', tier: 'B', share: 4, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'revvity-janus', vendor: 'revvity', name: 'Revvity Janus G3', category: 'Automation', tier: 'B', share: 3, pricing: 4, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'eppendorf-epmotion', vendor: 'eppendorf', name: 'Eppendorf epMotion 5075', category: 'Automation', tier: 'B', share: 5, pricing: 4, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'thermo-kingfisher', vendor: 'thermo', name: 'Thermo KingFisher Flex', category: 'Automation', tier: 'B', share: 6, pricing: 3, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'opentrons-flex', vendor: 'opentrons', name: 'Opentrons Flex', category: 'Automation', tier: 'B', share: 3, pricing: 2, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  // AUTOMATION — Tier C (Emerging / Specialty)
  { id: 'beckman-biomek-i3', vendor: 'beckman', name: 'Beckman Biomek i3 (Benchtop)', category: 'Automation', tier: 'C', share: 1, pricing: 3, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },
  { id: 'spt-firefly', vendor: 'spt_labtech', name: 'SPT Labtech firefly', category: 'Automation', tier: 'C', share: 1.5, pricing: 3, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'spt-mosquito', vendor: 'spt_labtech', name: 'SPT Labtech mosquito HV Genomics', category: 'Automation', tier: 'C', share: 1, pricing: 2, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'opentrons-ot2', vendor: 'opentrons', name: 'Opentrons OT-2', category: 'Automation', tier: 'C', share: 1, pricing: 1, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'clearlabs-dx', vendor: 'clearlabs', name: 'Clear Labs DX', category: 'Automation', tier: 'C', share: 1.0, pricing: 8, regulatory: 'FDA EUA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA EUA database",date:"2025-12"}} },
  { id: 'roche-magna-automation', vendor: 'roche', name: 'Roche MagNA Pure 96', category: 'Automation', tier: 'B', share: 4, pricing: 5, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'qiagen-qiacube', vendor: 'qiagen', name: 'QIAcube Connect', category: 'Automation', tier: 'B', share: 5, pricing: 4, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },

  // SEQUENCING — Illumina Short-Read
  { id: 'miseq', vendor: 'illumina', name: 'MiSeq', category: 'Sequencing', tier: 'B', share: 6, pricing: 70, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:9,we:7,hg:4,od:6}, growth: "declining", indications: ["solid_tumor","hereditary_cancer","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'miseqdx', vendor: 'illumina', name: 'MiSeqDx', category: 'Sequencing', tier: 'A', share: 10, pricing: 80, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:14,we:10,hg:6,od:9}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA 510(k)",date:"2025-12"}} },
  { id: 'miseq-i100', vendor: 'illumina', name: 'MiSeq i100 Series', category: 'Sequencing', tier: 'B', share: 2, pricing: 60, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },
  { id: 'nextseq-1000', vendor: 'illumina', name: 'NextSeq 1000', category: 'Sequencing', tier: 'B', share: 5, pricing: 100, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'nextseq', vendor: 'illumina', name: 'NextSeq 2000', category: 'Sequencing', tier: 'A', share: 12, pricing: 120, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:16,we:12,hg:7,od:11}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'nextseq-dx', vendor: 'illumina', name: 'NextSeq 550Dx', category: 'Sequencing', tier: 'A', share: 9, pricing: 130, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:12,we:9,hg:5,od:8}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA 510(k)",date:"2025-12"}} },
  { id: 'novaseq-x', vendor: 'illumina', name: 'NovaSeq X (Single Flow Cell)', category: 'Sequencing', tier: 'A', share: 6, pricing: 400, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:9,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics"], indicationShare: {solid_tumor:{global:8,na:10,we:8,hg:4,od:6}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'novaseq-x-plus', vendor: 'illumina', name: 'NovaSeq X Plus (Dual Flow Cell)', category: 'Sequencing', tier: 'A', share: 8, pricing: 600, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:12,we:9,hg:5,od:8}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics"], indicationShare: {solid_tumor:{global:10,na:14,we:10,hg:5,od:8}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'novaseq-6000', vendor: 'illumina', name: 'NovaSeq 6000', category: 'Sequencing', tier: 'B', share: 8, pricing: 500, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },

  // SEQUENCING — Thermo Fisher Semiconductor
  { id: 'genexus-system', vendor: 'genexus', name: 'Genexus Integrated Sequencer', category: 'Sequencing', tier: 'B', share: 3, pricing: 120, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {solid_tumor:{global:5,na:4,we:4,hg:8,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'ion-torrent', vendor: 'thermo', name: 'Ion GeneStudio S5', category: 'Sequencing', tier: 'B', share: 5, pricing: 65, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:6,hg:3,od:5}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'ion-s5', vendor: 'thermo', name: 'Ion S5 XL', category: 'Sequencing', tier: 'B', share: 4, pricing: 55, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:2,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'proton', vendor: 'thermo', name: 'Ion Proton (Legacy)', category: 'Sequencing', tier: 'C', share: 1, pricing: 90, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "declining", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },

  // SEQUENCING — MGI / Complete Genomics (BGI Group)
  { id: 'mgi-seq', vendor: 'mgi', name: 'DNBSEQ-G400 / G99', category: 'Sequencing', tier: 'B', share: 5, pricing: 50, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:3,hg:12,od:3}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'mgi-t7', vendor: 'mgi', name: 'DNBSEQ-T7', category: 'Sequencing', tier: 'B', share: 3, pricing: 200, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:6,od:1}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'cg-t1plus', vendor: 'complete_genomics', name: 'DNBSEQ-T1+RS', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 80, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:0,hg:2,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },
  { id: 'cg-e25', vendor: 'complete_genomics', name: 'E25 Flash Portable Sequencer', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 40, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:0,hg:2,od:0}, growth: "emerging", indications: ["infectious_disease","pharmacogenomics"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },

  // SEQUENCING — Roche (New Entrant)
  { id: 'roche-axelios', vendor: 'roche', name: 'Roche Axelios 1 (SBX)', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 150, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing - $150 genome",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },

  // SEQUENCING — Element Biosciences
  { id: 'element-aviti', vendor: 'element', name: 'AVITI', category: 'Sequencing', tier: 'C', share: 2, pricing: 100, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'element-aviti24', vendor: 'element', name: 'AVITI24 5D Multiomic', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 150, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },

  // SEQUENCING — Ultima Genomics
  { id: 'ultima-ug100', vendor: 'ultima', name: 'Ultima UG 100', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 100, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},pricing:{level:"approximate",source:"$80/genome bulk pricing",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'ultima-ug200', vendor: 'ultima', name: 'Ultima UG 200', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 80, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },

  // SEQUENCING — Long-Read Platforms
  { id: 'pacbio-revio', vendor: 'pacbio', name: 'PacBio Revio', category: 'Sequencing', tier: 'C', share: 2, pricing: 500, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'pacbio-vega', vendor: 'pacbio', name: 'PacBio Vega (Benchtop)', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 250, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","pharmacogenomics","hla_typing"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },
  { id: 'oxford-minion', vendor: 'oxford', name: 'Oxford Nanopore MinION', category: 'Sequencing', tier: 'C', share: 1, pricing: 500, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'oxford-promethion', vendor: 'oxford', name: 'Oxford Nanopore PromethION', category: 'Sequencing', tier: 'C', share: 1, pricing: 200, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'oxford-promethion-plus', vendor: 'oxford', name: 'PromethION Plus', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 180, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },

  // SEQUENCING — Singular Genomics
  { id: 'singular-g4x', vendor: 'singular', name: 'Singular G4X Spatial Sequencer', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 300, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Early adopter pricing",date:"2026-Q1"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2026-03"}} },

  // ANALYSIS
  { id: 'illumina-basespace', vendor: 'illumina', name: 'Illumina BaseSpace', category: 'Analysis', tier: 'A', share: 30, pricing: 0, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:19,we:14,hg:8,od:12}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'sophia-ddm', vendor: 'sophia', name: 'Sophia DDM', category: 'Analysis', tier: 'B', share: 15, pricing: 45, regulatory: 'EU EUDAMED', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:4,hg:16,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {solid_tumor:{global:12,na:8,we:18,hg:10,od:10},hereditary_cancer:{global:8,na:4,we:14,hg:6,od:6},heme_malig:{global:10,na:6,we:16,hg:8,od:8}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"estimated",source:"Channel intelligence",date:"2025-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'roche-seqexplorer', vendor: 'roche', name: 'Roche SeqExplorer', category: 'Analysis', tier: 'B', share: 13, pricing: 25, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'dragen', vendor: 'illumina', name: 'DRAGEN', category: 'Analysis', tier: 'A', share: 22, pricing: 8, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:14,we:10,hg:6,od:9}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"FDA 510(k)",date:"2025-12"}} },
  { id: 'thermo-torrent-suite', vendor: 'thermo', name: 'Torrent Suite', category: 'Analysis', tier: 'B', share: 9, pricing: 0, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:2,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'agilent-genomics-workbench', vendor: 'agilent', name: 'Genomics Workbench', category: 'Analysis', tier: 'B', share: 7, pricing: 15, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },
  { id: 'strand-ngs', vendor: 'qiagen', name: 'Strand NGS', category: 'Analysis', tier: 'C', share: 4, pricing: 10, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"estimated",source:"Manufacturer specs",date:"2025-12"}} },

  // REPORTING
  { id: 'qci-interpret', vendor: 'qiagen', name: 'QCI-Interpret', category: 'Reporting', tier: 'A', share: 30, pricing: 50, regulatory: 'EU EUDAMED', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:15,we:14,hg:9,od:12}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {solid_tumor:{global:24,na:28,we:22,hg:14,od:18},hereditary_cancer:{global:18,na:20,we:18,hg:10,od:15}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"estimated",source:"Channel intelligence",date:"2025-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'ici', vendor: 'illumina', name: 'ICI', category: 'Reporting', tier: 'A', share: 21, pricing: 35, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:12,we:9,hg:5,od:8}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {rare_disease:{global:15,na:18,we:14,hg:8,od:12}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"estimated",source:"Channel intelligence",date:"2025-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'varsome', vendor: 'saphetor', name: 'VarSome', category: 'Reporting', tier: 'B', share: 19, pricing: 30, regulatory: 'EU EUDAMED', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:9,we:9,hg:6,od:8}, growth: "stable", indications: ["hereditary_cancer","rare_disease"], indicationShare: {hereditary_cancer:{global:18,na:12,we:22,hg:16,od:14},rare_disease:{global:20,na:16,we:24,hg:18,od:16}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"estimated",source:"Channel intelligence",date:"2025-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'velsera-cg', vendor: 'velsera', name: 'Velsera CG', category: 'Reporting', tier: 'B', share: 15, pricing: 40, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"estimated",source:"Channel intelligence",date:"2025-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'fabric-gem', vendor: 'fabric', name: 'Fabric Genome', category: 'Reporting', tier: 'C', share: 6, pricing: 25, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "emerging", indications: ["hereditary_cancer","rare_disease"], indicationShare: {hereditary_cancer:{global:10,na:14,we:6,hg:4,od:6}}, confidence: {share:{level:"estimated",source:"DeciBio 2024",date:"2024-09"},pricing:{level:"estimated",source:"Channel intelligence",date:"2025-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'intellispace', vendor: 'philips', name: 'Intellispace Genomics', category: 'Reporting', tier: 'C', share: 5, pricing: 55, regulatory: 'EU EUDAMED', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
  { id: 'qiagen-curation', vendor: 'qiagen', name: 'Qiagen Curation Services', category: 'Reporting', tier: 'C', share: 4, pricing: 20, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View",date:"2025-Q4"},pricing:{level:"approximate",source:"Channel intelligence",date:"2025-Q4"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2025-12"}} },
];

const TIMELINE_EVENTS = [
  { year: 2015, event: 'Illumina DxSeq launch', vendor: 'illumina', impact: 'High' },
  { year: 2017, event: 'FDA NGS guidance published', vendor: 'regulatory', impact: 'High' },
  { year: 2018, event: 'Roche Avenio acquisition', vendor: 'roche', impact: 'Medium' },
  { year: 2019, event: 'QIAGEN QCI partnership', vendor: 'qiagen', impact: 'Medium' },
  { year: 2020, event: 'COVID-19 testing surge', vendor: 'industry', impact: 'High' },
  { year: 2021, event: 'Illumina TSOlex expansion', vendor: 'illumina', impact: 'Medium' },
  { year: 2022, event: 'NovaSeq X Series launch', vendor: 'illumina', impact: 'High' },
  { year: 2023, event: 'Ultima Genomics $100 genome debut', vendor: 'ultima', impact: 'High' },
  { year: 2024, event: 'Element AVITI24 multiomic platform', vendor: 'element', impact: 'Medium' },
  { year: 2024, event: 'Tempus AI IPO', vendor: 'tempus', impact: 'Medium' },
  { year: 2025, event: 'Roche Axelios 1 SBX sequencer debut ($150 genome)', vendor: 'roche', impact: 'High' },
  { year: 2025, event: 'Illumina MiSeq i100 Series launch', vendor: 'illumina', impact: 'Medium' },
  { year: 2025, event: 'PacBio SPRQ-Nx chemistry (40% cost reduction)', vendor: 'pacbio', impact: 'Medium' },
  { year: 2025, event: 'Complete Genomics DNBSEQ-T1+RS US launch', vendor: 'complete_genomics', impact: 'Medium' },
  { year: 2025, event: 'Singular G4X spatial sequencer shipping', vendor: 'singular', impact: 'Medium' },
  { year: 2026, event: 'Illumina NovaSeq X 35B reads + Q70 roadmap', vendor: 'illumina', impact: 'High' },
  { year: 2026, event: 'Ultima UG 200 launch ($80/genome bulk)', vendor: 'ultima', impact: 'High' },
  { year: 2026, event: 'Element Vitari high-throughput sequencer', vendor: 'element', impact: 'High' },
  { year: 2026, event: 'Oxford Nanopore PromethION Plus availability', vendor: 'oxford', impact: 'Medium' },
];

const COMPATIBILITY_LAYERS = [
  { key: 'ext_to_libprep', label: 'Extraction → Library Prep', source: 'Extraction', target: 'Library Prep' },
  { key: 'libprep_to_auto', label: 'Library Prep → Automation', source: 'Library Prep', target: 'Automation' },
  { key: 'libprep_to_seq', label: 'Library Prep → Sequencing', source: 'Library Prep', target: 'Sequencing' },
  { key: 'seq_to_analysis', label: 'Sequencing → Analysis', source: 'Sequencing', target: 'Analysis' },
  { key: 'analysis_to_report', label: 'Analysis → Reporting', source: 'Analysis', target: 'Reporting' },
];

const COMPATIBILITY = [
  { source: 'qiagen-ffpe-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'validated', notes: 'QIAamp FFPE → Illumina DNA Prep validated protocol', protocol: 'Illumina TN 1234' },
  { source: 'qiagen-ffpe-ext', target: 'illumina-tso500', layer: 'ext_to_libprep', level: 'validated', notes: 'Standard FFPE extraction for TSO500', protocol: 'Illumina TN 5678' },
  { source: 'qiagen-ffpe-ext', target: 'agilent-sureselect', layer: 'ext_to_libprep', level: 'validated', notes: 'QIAamp + SureSelect validated', protocol: 'Agilent AN 2345' },
  { source: 'qiagen-ffpe-ext', target: 'twist-panels', layer: 'ext_to_libprep', level: 'compatible', notes: 'Community validated' },
  { source: 'qiagen-ffpe-ext', target: 'idt-xgen', layer: 'ext_to_libprep', level: 'compatible', notes: 'Community validated' },
  { source: 'qiagen-ffpe-ext', target: 'kapa-hyperprep', layer: 'ext_to_libprep', level: 'validated', notes: 'KAPA application note', protocol: 'Roche AN 1122' },
  { source: 'qiagen-ffpe-ext', target: 'neb-ultraii', layer: 'ext_to_libprep', level: 'compatible', notes: 'Widely used combination' },
  { source: 'qiagen-ffpe-ext', target: 'oncomine-dx', layer: 'ext_to_libprep', level: 'validated', notes: 'Thermo Fisher validated protocol', protocol: 'TF AppNote 445' },
  { source: 'qiagen-blood-ext', target: 'illumina-hereditary', layer: 'ext_to_libprep', level: 'validated', notes: 'Standard blood→germline workflow' },
  { source: 'qiagen-blood-ext', target: 'roche-avenio', layer: 'ext_to_libprep', level: 'validated', notes: 'cfDNA workflow validated', protocol: 'Roche AN 3344' },
  { source: 'qiagen-blood-ext', target: 'illumina-tso500', layer: 'ext_to_libprep', level: 'validated', notes: 'ctDNA workflow', protocol: 'Illumina TN 9999' },
  { source: 'roche-magna-ext', target: 'kapa-hyperprep', layer: 'ext_to_libprep', level: 'validated', notes: 'Roche integrated workflow', protocol: 'Roche AN 5566' },
  { source: 'roche-magna-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Widely used' },
  { source: 'roche-magna-ext', target: 'roche-avenio', layer: 'ext_to_libprep', level: 'validated', notes: 'Roche end-to-end', protocol: 'Roche Protocol' },
  { source: 'thermo-magmax-ext', target: 'oncomine-dx', layer: 'ext_to_libprep', level: 'validated', notes: 'Thermo end-to-end', protocol: 'TF Protocol' },
  { source: 'thermo-magmax-ext', target: 'ion-ampliseq', layer: 'ext_to_libprep', level: 'validated', notes: 'Thermo integrated', protocol: 'TF Protocol' },
  { source: 'thermo-magmax-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Cross-platform validated' },
  { source: 'beckman-ampure-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'validated', notes: 'AMPure universal cleanup', protocol: 'Beckman AN 111' },
  { source: 'beckman-ampure-ext', target: 'kapa-hyperprep', layer: 'ext_to_libprep', level: 'validated', notes: 'Universal compatibility' },
  { source: 'promega-ffpe-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Community validated' },
  { source: 'promega-ffpe-ext', target: 'oncomine-dx', layer: 'ext_to_libprep', level: 'compatible', notes: 'Alternative extraction path' },
  { source: 'illumina-dna-prep', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'validated', notes: 'Tecan app note for DNA Prep', protocol: 'Tecan AN 456' },
  { source: 'illumina-dna-prep', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'Hamilton validated method', protocol: 'Hamilton ML 789' },
  { source: 'illumina-dna-prep', target: 'agilent-bravo', layer: 'libprep_to_auto', level: 'validated', notes: 'Bravo NGS method', protocol: 'Agilent AN 567' },
  { source: 'illumina-dna-prep', target: 'eppendorf-epmotion', layer: 'libprep_to_auto', level: 'compatible', notes: 'Community protocol' },
  { source: 'illumina-tso500', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 automation validated', protocol: 'Illumina TN 8888' },
  { source: 'illumina-tso500', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 Tecan protocol', protocol: 'Tecan AN 777' },
  { source: 'agilent-sureselect', target: 'agilent-bravo', layer: 'libprep_to_auto', level: 'validated', notes: 'Native integration', protocol: 'Agilent Protocol' },
  { source: 'agilent-sureselect', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'Hamilton SureSelect method' },
  { source: 'agilent-sureselect', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'compatible', notes: 'Third-party validated' },
  { source: 'kapa-hyperprep', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'KAPA Hamilton protocol' },
  { source: 'kapa-hyperprep', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'validated', notes: 'KAPA Tecan protocol' },
  { source: 'oncomine-dx', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'compatible', notes: 'Genexus preferred' },
  { source: 'ion-ampliseq', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'AmpliSeq automation', protocol: 'TF AN 333' },
  { source: 'twist-panels', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'Twist automation protocol' },
  { source: 'twist-panels', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'compatible', notes: 'Community validated' },
  { source: 'idt-xgen', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'xGen Hamilton protocol' },
  { source: 'neb-ultraii', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'compatible', notes: 'General lib prep automation' },
  { source: 'illumina-dna-prep', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina native', protocol: 'Illumina Protocol' },
  { source: 'illumina-dna-prep', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina native', protocol: 'Illumina Protocol' },
  { source: 'illumina-dna-prep', target: 'miseqdx', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina IVD path' },
  { source: 'illumina-tso500', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Recommended platform', protocol: 'Illumina Protocol' },
  { source: 'illumina-tso500', target: 'nextseq-dx', layer: 'libprep_to_seq', level: 'validated', notes: 'IVD workflow', protocol: 'Illumina IVD Protocol' },
  { source: 'illumina-tso500', target: 'mgi-seq', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Requires adapter conversion' },
  { source: 'agilent-sureselect', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina sequencing' },
  { source: 'agilent-sureselect', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina sequencing' },
  { source: 'agilent-sureselect', target: 'mgi-seq', layer: 'libprep_to_seq', level: 'compatible', notes: 'MGI adapter available' },
  { source: 'twist-panels', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'twist-panels', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'twist-panels', target: 'mgi-seq', layer: 'libprep_to_seq', level: 'compatible', notes: 'Requires conversion' },
  { source: 'oncomine-dx', target: 'ion-torrent', layer: 'libprep_to_seq', level: 'validated', notes: 'Thermo native', protocol: 'TF Protocol' },
  { source: 'oncomine-dx', target: 'ion-s5', layer: 'libprep_to_seq', level: 'validated', notes: 'Thermo native', protocol: 'TF Protocol' },
  { source: 'ion-ampliseq', target: 'ion-torrent', layer: 'libprep_to_seq', level: 'validated', notes: 'Thermo native', protocol: 'TF Protocol' },
  { source: 'ion-ampliseq', target: 'ion-s5', layer: 'libprep_to_seq', level: 'validated', notes: 'Thermo native' },
  { source: 'kapa-hyperprep', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Universal Illumina compatibility' },
  { source: 'kapa-hyperprep', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Universal Illumina compatibility' },
  { source: 'kapa-hyperprep', target: 'mgi-seq', layer: 'libprep_to_seq', level: 'compatible', notes: 'MGI adapter conversion' },
  { source: 'neb-ultraii', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'neb-ultraii', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'idt-xgen', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  { source: 'idt-xgen', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  { source: 'miseq', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'Native Illumina pipeline' },
  { source: 'miseq', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'DRAGEN on-instrument' },
  { source: 'miseq', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'validated', notes: 'SOPHiA DDM Illumina support' },
  { source: 'nextseq', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'Native' },
  { source: 'nextseq', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'DRAGEN pipeline' },
  { source: 'nextseq', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'validated', notes: 'SOPHiA DDM support' },
  { source: 'nextseq-dx', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'IVD pipeline', protocol: 'Illumina IVD' },
  { source: 'miseqdx', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'IVD pipeline' },
  { source: 'miseqdx', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'Native' },
  { source: 'ion-torrent', target: 'thermo-torrent-suite', layer: 'seq_to_analysis', level: 'validated', notes: 'Thermo native', protocol: 'TF Protocol' },
  { source: 'ion-s5', target: 'thermo-torrent-suite', layer: 'seq_to_analysis', level: 'validated', notes: 'Thermo native' },
  { source: 'ion-torrent', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'validated', notes: 'SOPHiA Ion support' },
  { source: 'mgi-seq', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'compatible', notes: 'MGI FASTQ support' },
  { source: 'mgi-seq', target: 'dragen', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ input supported' },
  { source: 'pacbio-revio', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Long-read support emerging' },
  { source: 'oxford-minion', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'theoretical', notes: 'ONT pipeline emerging' },
  { source: 'illumina-basespace', target: 'qci-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'VCF export to QCI' },
  { source: 'illumina-basespace', target: 'ici', layer: 'analysis_to_report', level: 'validated', notes: 'Illumina native', protocol: 'Illumina Protocol' },
  { source: 'illumina-basespace', target: 'varsome', layer: 'analysis_to_report', level: 'validated', notes: 'VCF/gVCF import' },
  { source: 'illumina-basespace', target: 'fabric-gem', layer: 'analysis_to_report', level: 'compatible', notes: 'VCF export' },
  { source: 'dragen', target: 'qci-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'DRAGEN VCF → QCI' },
  { source: 'dragen', target: 'ici', layer: 'analysis_to_report', level: 'validated', notes: 'Illumina integrated' },
  { source: 'dragen', target: 'varsome', layer: 'analysis_to_report', level: 'validated', notes: 'Standard VCF import' },
  { source: 'dragen', target: 'velsera-cg', layer: 'analysis_to_report', level: 'validated', notes: 'Velsera DRAGEN integration' },
  { source: 'sophia-ddm', target: 'qci-interpret', layer: 'analysis_to_report', level: 'compatible', notes: 'VCF interop' },
  { source: 'sophia-ddm', target: 'varsome', layer: 'analysis_to_report', level: 'compatible', notes: 'VCF export' },
  { source: 'thermo-torrent-suite', target: 'qci-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'VCF → QCI path' },
  { source: 'thermo-torrent-suite', target: 'intellispace', layer: 'analysis_to_report', level: 'compatible', notes: 'VCF interop' },
  { source: 'roche-seqexplorer', target: 'qci-interpret', layer: 'analysis_to_report', level: 'compatible', notes: 'VCF export' },
  { source: 'roche-seqexplorer', target: 'intellispace', layer: 'analysis_to_report', level: 'validated', notes: 'Hospital IT integration' },

  // Archer product compatibility
  { source: 'qiagen-ffpe-ext', target: 'archer-fusionplex', layer: 'ext_to_libprep', level: 'validated', notes: 'Recommended FFPE extraction for FusionPlex', protocol: 'Archer Protocol' },
  { source: 'qiagen-ffpe-ext', target: 'archer-variantplex', layer: 'ext_to_libprep', level: 'validated', notes: 'Recommended FFPE extraction for VariantPlex', protocol: 'Archer Protocol' },
  { source: 'qiagen-blood-ext', target: 'archer-liquidplex', layer: 'ext_to_libprep', level: 'validated', notes: 'cfDNA extraction for LiquidPlex', protocol: 'Archer Protocol' },
  { source: 'roche-magna-ext', target: 'archer-fusionplex', layer: 'ext_to_libprep', level: 'compatible', notes: 'Alternative extraction path' },
  { source: 'thermo-magmax-ext', target: 'archer-fusionplex', layer: 'ext_to_libprep', level: 'compatible', notes: 'Alternative extraction' },
  { source: 'promega-ffpe-ext', target: 'archer-fusionplex', layer: 'ext_to_libprep', level: 'compatible', notes: 'Maxwell RSC compatible' },
  { source: 'archer-fusionplex', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'FusionPlex-HT automation on Hamilton', protocol: 'Archer/Hamilton Protocol' },
  { source: 'archer-variantplex', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'VariantPlex-HT automation on Hamilton', protocol: 'Archer/Hamilton Protocol' },
  { source: 'archer-fusionplex', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'compatible', notes: 'Tecan automation available' },
  { source: 'archer-fusionplex', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina sequencing validated', protocol: 'Archer Protocol' },
  { source: 'archer-fusionplex', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina sequencing validated', protocol: 'Archer Protocol' },
  { source: 'archer-variantplex', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina sequencing validated', protocol: 'Archer Protocol' },
  { source: 'archer-variantplex', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina sequencing validated', protocol: 'Archer Protocol' },
  { source: 'archer-liquidplex', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina sequencing for cfDNA', protocol: 'Archer Protocol' },
  { source: 'archer-fusionplex', target: 'ion-torrent', layer: 'libprep_to_seq', level: 'validated', notes: 'Ion Torrent compatible', protocol: 'Archer Protocol' },
  { source: 'archer-variantplex', target: 'ion-torrent', layer: 'libprep_to_seq', level: 'validated', notes: 'Ion Torrent compatible', protocol: 'Archer Protocol' },
  // New sequencer compatibility entries
  { source: 'illumina-dna-prep', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina native', protocol: 'Illumina Protocol' },
  { source: 'illumina-dna-prep', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina native', protocol: 'Illumina Protocol' },
  { source: 'illumina-tso500', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'High-throughput TSO500', protocol: 'Illumina Protocol' },
  { source: 'illumina-tso500', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Production-scale TSO500', protocol: 'Illumina Protocol' },
  { source: 'agilent-sureselect', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina platform compatible' },
  { source: 'agilent-sureselect', target: 'element-aviti', layer: 'libprep_to_seq', level: 'compatible', notes: 'Element adapter conversion' },
  { source: 'twist-panels', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  { source: 'twist-panels', target: 'element-aviti', layer: 'libprep_to_seq', level: 'validated', notes: 'Twist-Element partnership', protocol: 'Twist AN 2025' },
  { source: 'kapa-hyperprep', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'Universal Illumina compatibility' },
  { source: 'kapa-hyperprep', target: 'element-aviti', layer: 'libprep_to_seq', level: 'compatible', notes: 'Adapter conversion available' },
  { source: 'kapa-hyperprep', target: 'ultima-ug100', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Requires Ultima library conversion' },
  { source: 'neb-ultraii', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'neb-ultraii', target: 'element-aviti', layer: 'libprep_to_seq', level: 'compatible', notes: 'Element adapter support' },
  { source: 'idt-xgen', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  { source: 'idt-xgen', target: 'element-aviti', layer: 'libprep_to_seq', level: 'compatible', notes: 'Element compatible' },
  { source: 'archer-fusionplex', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'compatible', notes: 'High-throughput option for FusionPlex' },
  { source: 'archer-variantplex', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'compatible', notes: 'High-throughput option for VariantPlex' },
  { source: 'archer-liquidplex', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'compatible', notes: 'High-throughput cfDNA option' },
  { source: 'archer-fusionplex', target: 'mgi-seq', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Requires adapter conversion for DNBSEQ' },
  { source: 'novaseq-x', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'Native Illumina pipeline' },
  { source: 'novaseq-x', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'DRAGEN on-instrument', protocol: 'Illumina Protocol' },
  { source: 'novaseq-x', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'validated', notes: 'SOPHiA DDM NovaSeq X support' },
  { source: 'novaseq-x-plus', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'Native' },
  { source: 'novaseq-x-plus', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'DRAGEN pipeline' },
  { source: 'novaseq-x-plus', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'validated', notes: 'SOPHiA DDM support' },
  { source: 'element-aviti', target: 'dragen', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ input supported' },
  { source: 'element-aviti', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ input supported' },
  { source: 'ultima-ug100', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Emerging FASTQ support' },
  { source: 'roche-axelios', target: 'roche-seqexplorer', layer: 'seq_to_analysis', level: 'validated', notes: 'Roche integrated pipeline' },
  { source: 'roche-axelios', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'FASTQ compatibility emerging' },
  { source: 'genexus-system', target: 'thermo-torrent-suite', layer: 'seq_to_analysis', level: 'validated', notes: 'Integrated sample-to-report', protocol: 'TF Protocol' },
  { source: 'mgi-t7', target: 'dragen', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ input' },
  { source: 'mgi-t7', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ support' },
  { source: 'pacbio-vega', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Long-read support emerging' },
  { source: 'oxford-promethion', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Long-read pipeline' },
  { source: 'oxford-promethion', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'theoretical', notes: 'ONT support emerging' },
  { source: 'nextseq-1000', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'Native' },
  { source: 'nextseq-1000', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'DRAGEN pipeline' },
  { source: 'novaseq-6000', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'Native' },
  { source: 'novaseq-6000', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'DRAGEN pipeline' },
  { source: 'illumina-dna-prep', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina native', protocol: 'Illumina Protocol' },
  { source: 'illumina-dna-prep', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina native', protocol: 'Illumina Protocol' },
  { source: 'illumina-tso500', target: 'miseq-i100', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Low throughput for TSO500' },
  { source: 'oncomine-dx', target: 'genexus-system', layer: 'libprep_to_seq', level: 'validated', notes: 'Thermo integrated sample-to-report', protocol: 'TF Protocol' },
  { source: 'ion-ampliseq', target: 'genexus-system', layer: 'libprep_to_seq', level: 'validated', notes: 'Thermo integrated', protocol: 'TF Protocol' },

  // ── EXPANDED LIBPREP → SEQ (fill gaps for all major lib preps × new sequencers) ──
  // Illumina lib preps → MiSeq i100
  { source: 'illumina-dna-prep', target: 'miseq-i100', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina native benchtop', protocol: 'Illumina Protocol' },
  { source: 'illumina-hereditary', target: 'miseq-i100', layer: 'libprep_to_seq', level: 'validated', notes: 'Low-throughput germline path' },
  { source: 'illumina-ampliseq', target: 'miseq-i100', layer: 'libprep_to_seq', level: 'validated', notes: 'Targeted panels on benchtop' },
  // Illumina lib preps → NextSeq 1000
  { source: 'illumina-tso500', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'compatible', notes: 'Possible but NextSeq 2000 preferred' },
  { source: 'illumina-hereditary', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'validated', notes: 'Germline panels on NextSeq 1000' },
  { source: 'illumina-rna-prep', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'validated', notes: 'RNA-Seq on NextSeq 1000' },
  { source: 'illumina-ampliseq', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'validated', notes: 'Targeted on NextSeq 1000' },
  // Illumina lib preps → NovaSeq 6000
  { source: 'illumina-tso500', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'High-throughput TSO500', protocol: 'Illumina Protocol' },
  { source: 'illumina-hereditary', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'Population-scale germline' },
  { source: 'illumina-rna-prep', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'High-throughput RNA-Seq' },
  // Illumina lib preps → NovaSeq X Plus
  { source: 'illumina-dna-prep', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina native', protocol: 'Illumina Protocol' },
  { source: 'illumina-hereditary', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Population-scale germline' },
  { source: 'illumina-rna-prep', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Production RNA-Seq' },
  { source: 'illumina-rna-prep', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'RNA-Seq on NovaSeq X' },
  // Major third-party → NovaSeq X Plus
  { source: 'agilent-sureselect', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina platform compatible' },
  { source: 'twist-panels', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  { source: 'kapa-hyperprep', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Universal Illumina compatibility' },
  { source: 'neb-ultraii', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'idt-xgen', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  // Major third-party → NovaSeq 6000
  { source: 'agilent-sureselect', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'twist-panels', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'kapa-hyperprep', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'Universal Illumina compatibility' },
  { source: 'neb-ultraii', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'idt-xgen', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  // Major third-party → NextSeq 1000
  { source: 'agilent-sureselect', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'twist-panels', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'kapa-hyperprep', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'validated', notes: 'Universal Illumina compatibility' },
  { source: 'neb-ultraii', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'compatible', notes: 'Illumina benchtop path' },
  { source: 'idt-xgen', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  // Major third-party → MiSeq i100
  { source: 'kapa-hyperprep', target: 'miseq-i100', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina benchtop compatible' },
  { source: 'neb-ultraii', target: 'miseq-i100', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina benchtop path' },
  // Archer products → all major Illumina sequencers
  { source: 'archer-fusionplex', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'compatible', notes: 'High-throughput FusionPlex option' },
  { source: 'archer-fusionplex', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'compatible', notes: 'FusionPlex on NovaSeq 6000' },
  { source: 'archer-fusionplex', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'compatible', notes: 'FusionPlex benchtop option' },
  { source: 'archer-fusionplex', target: 'nextseq-dx', layer: 'libprep_to_seq', level: 'compatible', notes: 'IVD path for FusionPlex' },
  { source: 'archer-fusionplex', target: 'miseqdx', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard clinical FusionPlex path', protocol: 'Archer Protocol' },
  { source: 'archer-fusionplex', target: 'element-aviti', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Requires adapter conversion for AVITI' },
  { source: 'archer-variantplex', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'compatible', notes: 'High-throughput VariantPlex option' },
  { source: 'archer-variantplex', target: 'novaseq-6000', layer: 'libprep_to_seq', level: 'compatible', notes: 'VariantPlex on NovaSeq 6000' },
  { source: 'archer-variantplex', target: 'nextseq-1000', layer: 'libprep_to_seq', level: 'compatible', notes: 'VariantPlex benchtop option' },
  { source: 'archer-variantplex', target: 'nextseq-dx', layer: 'libprep_to_seq', level: 'compatible', notes: 'IVD path for VariantPlex' },
  { source: 'archer-variantplex', target: 'miseqdx', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard clinical VariantPlex path', protocol: 'Archer Protocol' },
  { source: 'archer-variantplex', target: 'element-aviti', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Requires adapter conversion' },
  { source: 'archer-liquidplex', target: 'novaseq-x-plus', layer: 'libprep_to_seq', level: 'compatible', notes: 'High-throughput cfDNA option' },
  { source: 'archer-liquidplex', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard cfDNA sequencing', protocol: 'Archer Protocol' },
  { source: 'archer-liquidplex', target: 'miseqdx', layer: 'libprep_to_seq', level: 'validated', notes: 'IVD cfDNA path', protocol: 'Archer Protocol' },
  { source: 'archer-reveal-ctdna', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Reveal ctDNA on NextSeq 2000', protocol: 'Archer Protocol' },
  { source: 'archer-reveal-ctdna', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'compatible', notes: 'High-throughput ctDNA monitoring' },
  { source: 'archer-reveal-ctdna', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard ctDNA path', protocol: 'Archer Protocol' },
  // Roche lib preps → Roche Axelios (native ecosystem)
  { source: 'kapa-hyperprep', target: 'roche-axelios', layer: 'libprep_to_seq', level: 'validated', notes: 'Roche end-to-end SBX workflow', protocol: 'Roche Protocol' },
  { source: 'roche-avenio', target: 'roche-axelios', layer: 'libprep_to_seq', level: 'validated', notes: 'Roche integrated ctDNA pathway', protocol: 'Roche Protocol' },
  { source: 'roche-kapa-hypercap', target: 'roche-axelios', layer: 'libprep_to_seq', level: 'validated', notes: 'Roche capture + SBX', protocol: 'Roche Protocol' },
  { source: 'roche-kapa-rna', target: 'roche-axelios', layer: 'libprep_to_seq', level: 'compatible', notes: 'Roche RNA prep path' },
  { source: 'illumina-dna-prep', target: 'roche-axelios', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Cross-platform, adapter conversion needed' },
  // MGI / Complete Genomics lib prep ecosystem
  { source: 'mgi-cools-panels', target: 'mgi-seq', layer: 'libprep_to_seq', level: 'validated', notes: 'MGI native ecosystem', protocol: 'MGI Protocol' },
  { source: 'mgi-cools-panels', target: 'mgi-t7', layer: 'libprep_to_seq', level: 'validated', notes: 'MGI high-throughput', protocol: 'MGI Protocol' },
  { source: 'mgi-cools-panels', target: 'cg-t1plus', layer: 'libprep_to_seq', level: 'validated', notes: 'Complete Genomics compatible', protocol: 'CG Protocol' },
  { source: 'cleanplex', target: 'mgi-seq', layer: 'libprep_to_seq', level: 'validated', notes: 'Paragon MGI-compatible kits', protocol: 'Paragon AN' },
  { source: 'cleanplex', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  { source: 'cleanplex', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  // Element Biosciences ecosystem expansion
  { source: 'twist-panels', target: 'element-aviti24', layer: 'libprep_to_seq', level: 'validated', notes: 'Twist-Element partnership', protocol: 'Element Protocol' },
  { source: 'kapa-hyperprep', target: 'element-aviti24', layer: 'libprep_to_seq', level: 'compatible', notes: 'Adapter conversion available' },
  { source: 'illumina-dna-prep', target: 'element-aviti', layer: 'libprep_to_seq', level: 'compatible', notes: 'Adapter conversion for AVITI' },
  { source: 'illumina-dna-prep', target: 'element-aviti24', layer: 'libprep_to_seq', level: 'compatible', notes: 'Adapter conversion for AVITI24' },
  { source: 'watchmaker-dna', target: 'element-aviti', layer: 'libprep_to_seq', level: 'validated', notes: 'Watchmaker-Element collaboration', protocol: 'Element AN' },
  // Ultima Genomics ecosystem
  { source: 'illumina-dna-prep', target: 'ultima-ug100', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Requires Ultima flow conversion' },
  { source: 'illumina-dna-prep', target: 'ultima-ug200', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Requires Ultima flow conversion' },
  { source: 'kapa-hyperprep', target: 'ultima-ug200', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Ultima conversion workflow needed' },
  { source: 'neb-ultraii', target: 'ultima-ug100', layer: 'libprep_to_seq', level: 'theoretical', notes: 'Ultima conversion workflow' },
  // Qiagen panels → expanded sequencer coverage
  { source: 'qiaseq-panels', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'qiaseq-panels', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'Standard Illumina path' },
  { source: 'qiaseq-panels', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'Illumina compatible' },
  { source: 'qiaseq-panels', target: 'mgi-seq', layer: 'libprep_to_seq', level: 'compatible', notes: 'MGI adapter available' },
  // SOPHiA panels → sequencer coverage
  { source: 'sophia-panels', target: 'miseq', layer: 'libprep_to_seq', level: 'validated', notes: 'SOPHiA DDM validated path', protocol: 'SOPHiA Protocol' },
  { source: 'sophia-panels', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'SOPHiA DDM validated', protocol: 'SOPHiA Protocol' },
  { source: 'sophia-panels', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'compatible', notes: 'High-throughput SOPHiA path' },
  { source: 'sophia-panels', target: 'ion-torrent', layer: 'libprep_to_seq', level: 'validated', notes: 'SOPHiA Ion Torrent support', protocol: 'SOPHiA Protocol' },

  // ── EXPANDED SEQ → ANALYSIS (fill gaps for new sequencers) ──
  { source: 'miseq-i100', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'Native Illumina pipeline' },
  { source: 'miseq-i100', target: 'dragen', layer: 'seq_to_analysis', level: 'validated', notes: 'DRAGEN pipeline' },
  { source: 'miseq-i100', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ input supported' },
  { source: 'nextseq-dx', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'validated', notes: 'IVD pipeline' },
  { source: 'nextseq-1000', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'validated', notes: 'SOPHiA DDM support' },
  { source: 'novaseq-6000', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'validated', notes: 'SOPHiA DDM support' },
  { source: 'genexus-system', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'compatible', notes: 'Ion FASTQ export to SOPHiA' },
  { source: 'ion-s5', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'validated', notes: 'SOPHiA Ion support' },
  { source: 'ion-s5', target: 'thermo-torrent-suite', layer: 'seq_to_analysis', level: 'validated', notes: 'Thermo native' },
  { source: 'proton', target: 'thermo-torrent-suite', layer: 'seq_to_analysis', level: 'validated', notes: 'Legacy Thermo support' },
  { source: 'cg-t1plus', target: 'dragen', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ input' },
  { source: 'cg-t1plus', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'theoretical', notes: 'FASTQ support emerging' },
  { source: 'element-aviti24', target: 'dragen', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ input' },
  { source: 'element-aviti24', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ support' },
  { source: 'element-aviti', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Non-native but FASTQ import possible' },
  { source: 'ultima-ug200', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'FASTQ support emerging' },
  { source: 'roche-axelios', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'theoretical', notes: 'SBX FASTQ pipeline emerging' },
  { source: 'pacbio-revio', target: 'sophia-ddm', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Long-read support emerging' },
  { source: 'oxford-minion', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'ONT pipeline emerging' },
  { source: 'singular-g4x', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Spatial data pipeline emerging' },
  { source: 'singular-g4x', target: 'illumina-basespace', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Spatial + sequencing data' },

  // ── EXPANDED LIBPREP → AUTO ──
  { source: 'archer-fusionplex', target: 'agilent-bravo', layer: 'libprep_to_auto', level: 'compatible', notes: 'Bravo automation available' },
  { source: 'archer-liquidplex', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'compatible', notes: 'Hamilton LiquidPlex automation' },
  { source: 'twist-panels', target: 'agilent-bravo', layer: 'libprep_to_auto', level: 'validated', notes: 'Twist Bravo automation', protocol: 'Twist AN' },
  { source: 'roche-avenio', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'AVENIO Hamilton automation', protocol: 'Roche Protocol' },
  { source: 'roche-avenio', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'validated', notes: 'AVENIO Tecan automation', protocol: 'Roche Protocol' },
  { source: 'qiaseq-panels', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'QIAseq Hamilton method', protocol: 'Qiagen Protocol' },
  { source: 'qiaseq-panels', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'validated', notes: 'QIAseq Tecan method', protocol: 'Qiagen Protocol' },
  { source: 'sophia-panels', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'compatible', notes: 'Standard automation path' },
  { source: 'cleanplex', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'compatible', notes: 'CleanPlex automation' },
  { source: 'illumina-tso500-hrd', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 HRD automation', protocol: 'Illumina Protocol' },
  { source: 'illumina-tso500-hrd', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 HRD Tecan method', protocol: 'Illumina Protocol' },

  // ── EXPANDED LIBPREP → AUTO (Beckman Biomek, Revvity, SPT, Opentrons) ──
  // Beckman Biomek i7
  { source: 'illumina-dna-prep', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'validated', notes: 'Biomek i7 DNA Prep protocol', protocol: 'Beckman AN NGS-001' },
  { source: 'illumina-tso500', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 Biomek automation', protocol: 'Beckman AN NGS-003' },
  { source: 'kapa-hyperprep', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'validated', notes: 'KAPA Biomek protocol', protocol: 'Roche/Beckman AN' },
  { source: 'agilent-sureselect', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'validated', notes: 'SureSelect Biomek method', protocol: 'Agilent/Beckman AN' },
  { source: 'twist-panels', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'validated', notes: 'Twist Biomek protocol', protocol: 'Twist AN' },
  { source: 'neb-ultraii', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'compatible', notes: 'General lib prep automation' },
  { source: 'idt-xgen', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'validated', notes: 'xGen Biomek method', protocol: 'IDT AN' },
  { source: 'archer-fusionplex', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'compatible', notes: 'FusionPlex Biomek automation' },
  { source: 'archer-variantplex', target: 'beckman-biomek-i7', layer: 'libprep_to_auto', level: 'compatible', notes: 'VariantPlex Biomek automation' },
  // Beckman Biomek i5
  { source: 'illumina-dna-prep', target: 'beckman-biomek-i5', layer: 'libprep_to_auto', level: 'validated', notes: 'Biomek i5 DNA Prep protocol', protocol: 'Beckman AN NGS-002' },
  { source: 'kapa-hyperprep', target: 'beckman-biomek-i5', layer: 'libprep_to_auto', level: 'validated', notes: 'KAPA Biomek i5 protocol' },
  { source: 'illumina-tso500', target: 'beckman-biomek-i5', layer: 'libprep_to_auto', level: 'compatible', notes: 'Mid-throughput TSO500' },
  // Beckman NGeniuS (dedicated NGS)
  { source: 'illumina-dna-prep', target: 'beckman-ngenius', layer: 'libprep_to_auto', level: 'validated', notes: 'NGeniuS purpose-built for lib prep', protocol: 'Beckman NGeniuS Protocol' },
  { source: 'kapa-hyperprep', target: 'beckman-ngenius', layer: 'libprep_to_auto', level: 'validated', notes: 'NGeniuS KAPA workflow', protocol: 'Beckman NGeniuS Protocol' },
  { source: 'neb-ultraii', target: 'beckman-ngenius', layer: 'libprep_to_auto', level: 'validated', notes: 'NGeniuS NEBNext workflow', protocol: 'Beckman NGeniuS Protocol' },
  // Revvity Sciclone NGSx iQ
  { source: 'illumina-dna-prep', target: 'revvity-sciclone', layer: 'libprep_to_auto', level: 'validated', notes: 'Sciclone NGSx DNA Prep', protocol: 'Revvity AN' },
  { source: 'illumina-tso500', target: 'revvity-sciclone', layer: 'libprep_to_auto', level: 'compatible', notes: 'Sciclone TSO500 method' },
  { source: 'kapa-hyperprep', target: 'revvity-sciclone', layer: 'libprep_to_auto', level: 'validated', notes: 'KAPA Sciclone protocol' },
  { source: 'agilent-sureselect', target: 'revvity-sciclone', layer: 'libprep_to_auto', level: 'compatible', notes: 'SureSelect on Sciclone' },
  { source: 'nextflex', target: 'revvity-sciclone', layer: 'libprep_to_auto', level: 'validated', notes: 'Revvity native integration', protocol: 'Revvity Protocol' },
  // Revvity Janus G3
  { source: 'illumina-dna-prep', target: 'revvity-janus', layer: 'libprep_to_auto', level: 'compatible', notes: 'Janus G3 general automation' },
  { source: 'kapa-hyperprep', target: 'revvity-janus', layer: 'libprep_to_auto', level: 'compatible', notes: 'KAPA Janus automation' },
  { source: 'nextflex', target: 'revvity-janus', layer: 'libprep_to_auto', level: 'validated', notes: 'Revvity native', protocol: 'Revvity Protocol' },
  // Eppendorf epMotion
  { source: 'illumina-dna-prep', target: 'eppendorf-epmotion', layer: 'libprep_to_auto', level: 'validated', notes: 'epMotion DNA Prep method', protocol: 'Eppendorf AN' },
  { source: 'kapa-hyperprep', target: 'eppendorf-epmotion', layer: 'libprep_to_auto', level: 'validated', notes: 'KAPA epMotion protocol' },
  { source: 'neb-ultraii', target: 'eppendorf-epmotion', layer: 'libprep_to_auto', level: 'validated', notes: 'NEBNext epMotion protocol' },
  // Opentrons Flex
  { source: 'illumina-dna-prep', target: 'opentrons-flex', layer: 'libprep_to_auto', level: 'validated', notes: 'Opentrons Flex DNA Prep', protocol: 'Opentrons Protocol Library' },
  { source: 'kapa-hyperprep', target: 'opentrons-flex', layer: 'libprep_to_auto', level: 'compatible', notes: 'Community Python protocol' },
  { source: 'neb-ultraii', target: 'opentrons-flex', layer: 'libprep_to_auto', level: 'compatible', notes: 'Community protocol' },
  { source: 'illumina-dna-prep', target: 'opentrons-ot2', layer: 'libprep_to_auto', level: 'compatible', notes: 'OT-2 community protocol' },
  // SPT Labtech firefly
  { source: 'illumina-dna-prep', target: 'spt-firefly', layer: 'libprep_to_auto', level: 'validated', notes: 'firefly NGS lib prep', protocol: 'SPT Labtech AN' },
  { source: 'kapa-hyperprep', target: 'spt-firefly', layer: 'libprep_to_auto', level: 'validated', notes: 'KAPA firefly protocol', protocol: 'SPT Labtech AN' },
  { source: 'neb-ultraii', target: 'spt-firefly', layer: 'libprep_to_auto', level: 'validated', notes: 'NEBNext firefly protocol', protocol: 'SPT Labtech AN' },
  { source: 'twist-panels', target: 'spt-firefly', layer: 'libprep_to_auto', level: 'compatible', notes: 'Twist on firefly' },
  // Thermo KingFisher Flex (extraction/cleanup automation)
  { source: 'illumina-dna-prep', target: 'thermo-kingfisher', layer: 'libprep_to_auto', level: 'compatible', notes: 'KingFisher bead cleanup step' },
  { source: 'oncomine-dx', target: 'thermo-kingfisher', layer: 'libprep_to_auto', level: 'validated', notes: 'Thermo integrated extraction', protocol: 'TF Protocol' },
  // QIAcube Connect
  { source: 'qiaseq-panels', target: 'qiagen-qiacube', layer: 'libprep_to_auto', level: 'validated', notes: 'Qiagen native extraction automation', protocol: 'Qiagen Protocol' },
  // Hamilton VANTAGE
  { source: 'illumina-dna-prep', target: 'hamilton-vantage', layer: 'libprep_to_auto', level: 'validated', notes: 'VANTAGE DNA Prep method', protocol: 'Hamilton Protocol' },
  { source: 'illumina-tso500', target: 'hamilton-vantage', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 VANTAGE automation', protocol: 'Hamilton Protocol' },
  { source: 'kapa-hyperprep', target: 'hamilton-vantage', layer: 'libprep_to_auto', level: 'validated', notes: 'KAPA VANTAGE method' },
  { source: 'agilent-sureselect', target: 'hamilton-vantage', layer: 'libprep_to_auto', level: 'validated', notes: 'SureSelect VANTAGE method' },
  { source: 'twist-panels', target: 'hamilton-vantage', layer: 'libprep_to_auto', level: 'validated', notes: 'Twist VANTAGE protocol' },
  { source: 'archer-fusionplex', target: 'hamilton-vantage', layer: 'libprep_to_auto', level: 'validated', notes: 'Archer VANTAGE automation', protocol: 'Archer/Hamilton Protocol' },
  { source: 'archer-variantplex', target: 'hamilton-vantage', layer: 'libprep_to_auto', level: 'validated', notes: 'Archer VANTAGE automation', protocol: 'Archer/Hamilton Protocol' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const getTier = (product) => {
  const tierMap = { 'A': 1, 'B': 2, 'C': 3 };
  return tierMap[product.tier] || 3;
};

const getGrowthIcon = (impact) => {
  if (impact === 'High') return <TrendingUp className="w-4 h-4 text-green-400" />;
  return <TrendingUp className="w-4 h-4 text-gray-500" />;
};

const getRegulatoryBadge = (regulatory) => {
  const colors = {
    'CE-IVD': 'bg-green-900 text-green-200',
    'FDA 510(k)': 'bg-blue-900 text-blue-200',
    'FDA EUA': 'bg-purple-900 text-purple-200',
    'FDA Breakthrough': 'bg-red-900 text-red-200',
    'EU EUDAMED': 'bg-teal-900 text-teal-200',
    'ISO 13485': 'bg-gray-700 text-gray-200',
  };
  return colors[regulatory] || 'bg-gray-700 text-gray-200';
};

// ============================================
// NEW COMPONENTS & PHASE 3
// ============================================

const ConfidenceDot = ({ conf }) => {
  const [showTip, setShowTip] = useState(false);
  if (!conf) return null;
  const colors = { verified:"#34d399", estimated:"#6c8cff", approximate:"#fbbf24", unverified:"#ef4444" };
  return (
    <span className="relative inline-block ml-1" onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{background: colors[conf.level] || "#8b90a5"}} />
      {showTip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs whitespace-nowrap z-50 shadow-lg">
          <span className="font-bold capitalize" style={{color:colors[conf.level]}}>{conf.level}</span>
          <br/><span className="text-gray-400">{conf.source}</span>
          <br/><span className="text-gray-500">{conf.date}</span>
        </span>
      )}
    </span>
  );
};

const IndicationFilterBar = ({ indicationFilter, setIndicationFilter }) => {
  const toggleIndication = (key) => {
    setIndicationFilter(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  return (
    <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setIndicationFilter([])}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            indicationFilter.length === 0
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Indications
        </button>
        {INDICATIONS.map(ind => (
          <button
            key={ind.key}
            onClick={() => toggleIndication(ind.key)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1"
            style={{
              backgroundColor: indicationFilter.includes(ind.key)
                ? `${ind.color}33`
                : '#1f2937',
              color: indicationFilter.includes(ind.key)
                ? ind.color
                : '#9ca3af',
              border: `1px solid ${indicationFilter.includes(ind.key) ? ind.color : 'transparent'}`
            }}
          >
            <span>{ind.icon}</span>
            <span>{ind.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const IndicationHeatmap = ({ products }) => {
  const vendorShares = useMemo(() => {
    const vendorMap = {};
    products.forEach(p => {
      if (!vendorMap[p.vendor]) vendorMap[p.vendor] = 0;
      vendorMap[p.vendor] += p.share || 0;
    });
    return Object.entries(vendorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([key]) => key);
  }, [products]);

  const getCellData = (vendorKey, indicationKey) => {
    const vendorProds = products.filter(p => p.vendor === vendorKey && p.indications?.includes(indicationKey));
    const count = vendorProds.length;
    const indication = INDICATIONS.find(i => i.key === indicationKey);
    let maxShare = 0;
    vendorProds.forEach(p => {
      if (p.indicationShare?.[indicationKey]?.global) {
        maxShare = Math.max(maxShare, p.indicationShare[indicationKey].global);
      }
    });
    return { count, maxShare, indication };
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 overflow-x-auto">
      <h3 className="text-lg font-bold text-white mb-4">Vendor-Indication Matrix</h3>
      <div className="inline-block">
        <div className="flex">
          <div className="w-40"></div>
          <div className="flex gap-0">
            {INDICATIONS.map(ind => (
              <div key={ind.key} className="w-20 text-center">
                <div className="text-xs text-gray-400">{ind.icon}</div>
                <div className="text-xs text-gray-500 truncate">{ind.label}</div>
              </div>
            ))}
          </div>
        </div>
        {vendorShares.map(vendorKey => {
          const vendor = VENDORS.find(v => v.key === vendorKey);
          return (
            <div key={vendorKey} className="flex">
              <div className="w-40 pr-3 py-2 text-sm font-medium text-gray-300 text-right">{vendor?.label}</div>
              <div className="flex gap-0">
                {INDICATIONS.map(ind => {
                  const { count, maxShare } = getCellData(vendorKey, ind.key);
                  let opacity = 'bg-gray-800/50';
                  if (count >= 2) opacity = `opacity-60`;
                  else if (count === 1) opacity = `opacity-30`;

                  return (
                    <div
                      key={ind.key}
                      className={`w-20 h-12 flex items-center justify-center border border-gray-800 ${count > 0 ? opacity : ''}`}
                      style={count > 0 ? { backgroundColor: `${ind.color}${count >= 2 ? '99' : '4d'}` } : {}}
                      title={`${count} product${count !== 1 ? 's' : ''} ${maxShare > 0 ? `(${maxShare}% share)` : ''}`}
                    >
                      {maxShare > 0 && <span className="text-xs font-bold text-white">{maxShare}%</span>}
                      {count > 0 && maxShare === 0 && <span className="text-xs font-bold" style={{color: ind.color}}>{count}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// PHASE 3: WORKFLOW BUILDER COMPONENT
const WorkflowBuilder = ({ products }) => {
  const [builderMode, setBuilderMode] = useState(false);
  const [selections, setSelections] = useState({ extraction: null, libprep: null, automation: null, sequencing: null, analysis: null, reporting: null });

  const steps = [
    { key: 'extraction', label: 'Extraction', category: 'Extraction' },
    { key: 'libprep', label: 'Library Prep', category: 'Library Prep' },
    { key: 'automation', label: 'Automation', category: 'Automation' },
    { key: 'sequencing', label: 'Sequencing', category: 'Sequencing' },
    { key: 'analysis', label: 'Analysis', category: 'Analysis' },
    { key: 'reporting', label: 'Reporting', category: 'Reporting' },
  ];

  const getProductsForStep = (stepKey) => {
    const step = steps.find(s => s.key === stepKey);
    const categoryProducts = products.filter(p => p.category === step.category);

    if (stepKey === 'extraction') return categoryProducts;

    if (stepKey === 'libprep' && selections.extraction) {
      const compat = COMPATIBILITY.filter(c => c.layer === 'ext_to_libprep' && c.source === selections.extraction);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    if (stepKey === 'automation' && selections.libprep) {
      const compat = COMPATIBILITY.filter(c => c.layer === 'libprep_to_auto' && c.source === selections.libprep);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    if (stepKey === 'sequencing' && selections.libprep) {
      const compat = COMPATIBILITY.filter(c => c.layer === 'libprep_to_seq' && c.source === selections.libprep);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    if (stepKey === 'analysis' && selections.sequencing) {
      const compat = COMPATIBILITY.filter(c => c.layer === 'seq_to_analysis' && c.source === selections.sequencing);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    if (stepKey === 'reporting' && selections.analysis) {
      const compat = COMPATIBILITY.filter(c => c.layer === 'analysis_to_report' && c.source === selections.analysis);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    return categoryProducts;
  };

  const getCompatibilityLevel = (sourceId, targetId, layer) => {
    const compat = COMPATIBILITY.find(c => c.source === sourceId && c.target === targetId && c.layer === layer);
    return compat?.level || null;
  };

  const selectProduct = (stepKey, productId) => {
    setSelections(prev => ({
      ...prev,
      [stepKey]: prev[stepKey] === productId ? null : productId
    }));
  };

  const clearWorkflow = () => {
    setSelections({ extraction: null, libprep: null, automation: null, sequencing: null, analysis: null, reporting: null });
  };

  const getCompatlevel = (src, tgt, layer) => {
    const c = COMPATIBILITY.find(x => x.source === src && x.target === tgt && x.layer === layer);
    return c?.level || 'none';
  };

  const getProduct = (id) => products.find(p => p.id === id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Workflow Builder</h3>
        <button onClick={clearWorkflow} className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">Clear All</button>
      </div>

      {/* Pipeline summary bar */}
      <div className="flex items-center bg-gray-800 rounded-lg p-3 border border-gray-700 overflow-x-auto gap-1">
        {steps.map((step, idx) => {
          const prod = getProduct(selections[step.key]);
          const v = prod ? VENDORS.find(v => v.key === prod.vendor) : null;
          return (
            <React.Fragment key={step.key}>
              <div className={`flex-1 min-w-0 rounded-lg p-2 text-center ${prod ? 'bg-gray-700' : 'bg-gray-900'}`}>
                <div className="text-xs text-gray-400 truncate">{step.label}</div>
                {prod ? (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: v?.color || '#6b7280' }}></span>
                    <span className="text-xs font-bold text-white truncate">{prod.name}</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 mt-1">—</div>
                )}
              </div>
              {idx < steps.length - 1 && <div className="text-gray-600 flex-shrink-0">→</div>}
            </React.Fragment>
          );
        })}
      </div>

      {steps.map((step, stepIdx) => {
        const stepProducts = getProductsForStep(step.key);
        const prevStep = stepIdx > 0 ? steps[stepIdx - 1] : null;
        const isDisabled = stepIdx > 0 && !selections[steps[stepIdx - 1].key];
        const isCompleted = selections[step.key] !== null;
        const allProducts = products.filter(p => p.category === step.category);
        const isFiltered = stepIdx > 0 && selections[steps[stepIdx - 1].key] && stepProducts.length < allProducts.length;

        return (
          <div key={step.key} className={`bg-gray-800 rounded-lg border transition-all ${isDisabled ? 'opacity-40 border-gray-700' : isCompleted ? 'border-blue-600/50' : 'border-gray-700'}`}>
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-blue-600 text-white' : isDisabled ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 text-gray-300'}`}>{stepIdx + 1}</span>
                <h4 className="text-sm font-bold text-white">{step.label}</h4>
                <span className="text-xs text-gray-500">
                  {isFiltered ? `${stepProducts.length} compatible (${allProducts.length} total)` : `${stepProducts.length} products`}
                </span>
              </div>
              {isCompleted && (
                <button onClick={() => selectProduct(step.key, selections[step.key])} className="text-xs text-gray-500 hover:text-red-400">Deselect</button>
              )}
            </div>
            {!isDisabled && (
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                {stepProducts.map(prod => {
                  const isSelected = selections[step.key] === prod.id;
                  const v = VENDORS.find(v => v.key === prod.vendor);
                  const levelColor = { validated: '#10b981', compatible: '#f59e0b', theoretical: '#6b7280', none: '#374151' };
                  const prevLayerKey = prevStep ? COMPATIBILITY_LAYERS.find(l => l.target === step.category)?.key : null;
                  const level = prevLayerKey && selections[prevStep.key] ? getCompatlevel(selections[prevStep.key], prod.id, prevLayerKey) : null;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => selectProduct(step.key, prod.id)}
                      className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: v?.color || '#6b7280' }}></span>
                        <span className="font-bold text-white text-xs truncate">{prod.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{v?.label || prod.vendor}</span>
                        <div className="flex items-center gap-1.5">
                          {prod.share > 0 && <span className="text-xs text-gray-500">{prod.share}%</span>}
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${prod.tier === 'A' ? 'bg-green-900/40 text-green-400' : prod.tier === 'B' ? 'bg-blue-900/40 text-blue-400' : 'bg-gray-700/40 text-gray-400'}`}>{prod.tier}</span>
                        </div>
                      </div>
                      {level && (
                        <div className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: `${levelColor[level]}20`, color: levelColor[level] }}>
                          {level}
                        </div>
                      )}
                    </div>
                  );
                })}
                {stepProducts.length === 0 && !isDisabled && (
                  <div className="col-span-3 text-center text-gray-500 text-sm py-4">No compatible products found. Try a different upstream selection.</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// PHASE 3: DATA QUALITY VIEW
const DataQualityView = ({ products }) => {
  const confData = useMemo(() => {
    const counts = { verified: 0, estimated: 0, approximate: 0, unverified: 0 };
    products.forEach(p => {
      if (p.confidence?.share) counts[p.confidence.share.level] = (counts[p.confidence.share.level] || 0) + 1;
      if (p.confidence?.pricing) counts[p.confidence.pricing.level] = (counts[p.confidence.pricing.level] || 0) + 1;
      if (p.confidence?.regulatory) counts[p.confidence.regulatory.level] = (counts[p.confidence.regulatory.level] || 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => ({ name: k, value: v, color: { verified: '#10b981', estimated: '#6c8cff', approximate: '#fbbf24', unverified: '#ef4444' }[k] }));
  }, [products]);

  const catConfData = useMemo(() => {
    const data = {};
    CATEGORIES.forEach(cat => {
      data[cat] = { verified: 0, estimated: 0, approximate: 0, unverified: 0 };
      products.filter(p => p.category === cat).forEach(p => {
        if (p.confidence?.share) data[cat][p.confidence.share.level]++;
        if (p.confidence?.pricing) data[cat][p.confidence.pricing.level]++;
        if (p.confidence?.regulatory) data[cat][p.confidence.regulatory.level]++;
      });
    });
    return Object.entries(data).map(([cat, counts]) => ({ category: cat, ...counts }));
  }, [products]);

  const staleData = useMemo(() => {
    const sixMonthsAgo = '2025-09';
    const stale = [];
    products.forEach(p => {
      ['share', 'pricing', 'regulatory'].forEach(field => {
        if (p.confidence?.[field]?.date && p.confidence[field].date < sixMonthsAgo) {
          stale.push({ product: p.name, field, date: p.confidence[field].date, level: p.confidence[field].level });
        }
      });
    });
    return stale;
  }, [products]);

  const qualityScore = useMemo(() => {
    let total = 0, weighted = 0;
    products.forEach(p => {
      ['share', 'pricing', 'regulatory'].forEach(field => {
        if (p.confidence?.[field]) {
          total++;
          const weights = { verified: 100, estimated: 75, approximate: 50, unverified: 25 };
          weighted += weights[p.confidence[field].level] || 0;
        }
      });
    });
    return total > 0 ? Math.round(weighted / total) : 0;
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Confidence Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={confData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {confData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Quality Score</h3>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-400">{qualityScore}</div>
              <div className="text-gray-400 mt-2">out of 100</div>
              <div className="mt-4 text-sm text-gray-500">Overall data quality</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Confidence by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={catConfData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="category" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Legend />
            <Bar dataKey="verified" fill="#10b981" />
            <Bar dataKey="estimated" fill="#6c8cff" />
            <Bar dataKey="approximate" fill="#fbbf24" />
            <Bar dataKey="unverified" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {staleData.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4">Stale Data Alert</h3>
          <div className="space-y-2">
            {staleData.slice(0, 10).map((item, idx) => (
              <div key={idx} className="text-sm text-gray-300">
                <span className="font-bold text-white">{item.product}</span> - {item.field} ({item.date})
              </div>
            ))}
            {staleData.length > 10 && <div className="text-sm text-gray-400 mt-3">+{staleData.length - 10} more</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// PHASE 3: EXPORT BRIEF
const generateBrief = (products) => {
  const vendorCount = new Set(products.map(p => p.vendor)).size;
  const productCount = products.length;
  const indicationCount = INDICATIONS.length;

  const marketLeaders = {};
  CATEGORIES.forEach(cat => {
    const catProds = products.filter(p => p.category === cat).sort((a, b) => (b.share || 0) - (a.share || 0));
    marketLeaders[cat] = catProds.slice(0, 3);
  });

  const topProducts = products.sort((a, b) => (b.share || 0) - (a.share || 0)).slice(0, 5);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>NGS Competitive Brief</title>
  <style>
    body { font-family: 'Georgia', serif; background: white; color: #333; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px; }
    h1 { color: #1e3a8a; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #f3f4f6; font-weight: bold; }
    tr:nth-child(even) { background: #f9fafb; }
    .stat { display: inline-block; margin-right: 30px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>NGS Competitive Intelligence Brief</h1>
    <p>Generated: ${new Date().toLocaleDateString()}</p>

    <h2>Executive Summary</h2>
    <p>
      <div class="stat">
        <div class="stat-value">${vendorCount}</div>
        Vendors
      </div>
      <div class="stat">
        <div class="stat-value">${productCount}</div>
        Products
      </div>
      <div class="stat">
        <div class="stat-value">${indicationCount}</div>
        Indications
      </div>
    </p>

    <h2>Market Leaders by Category</h2>
    ${CATEGORIES.map(cat => {
      const leaders = marketLeaders[cat] || [];
      return `
        <h3>${cat}</h3>
        <table>
          <tr><th>Product</th><th>Vendor</th><th>Market Share</th></tr>
          ${leaders.map(p => `<tr><td>${p.name}</td><td>${VENDORS.find(v => v.key === p.vendor)?.label || p.vendor}</td><td>${p.share || 0}%</td></tr>`).join('')}
        </table>
      `;
    }).join('')}

    <h2>Top 5 Products by Market Share</h2>
    <table>
      <tr><th>Product</th><th>Category</th><th>Vendor</th><th>Market Share</th></tr>
      ${topProducts.map(p => `<tr><td>${p.name}</td><td>${p.category}</td><td>${VENDORS.find(v => v.key === p.vendor)?.label || p.vendor}</td><td>${p.share || 0}%</td></tr>`).join('')}
    </table>

    <h2>Indication Coverage</h2>
    <p>Platform covers ${INDICATIONS.length} clinical indications across solid tumors, liquid biopsy, hereditary cancer, heme malignancies, rare diseases, pharmacogenomics, HLA typing, and infectious disease.</p>

    <h2>Data Quality</h2>
    <p>Dataset includes comprehensive compatibility matrices across 5 workflow layers with validated, compatible, and theoretical relationships documented.</p>

    <div class="footer">
      NGS Intel Platform v2 - Market Intelligence Dashboard
    </div>
  </div>
</body>
</html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ngs-competitive-brief.html';
  a.click();
  URL.revokeObjectURL(url);
};

const Sidebar = ({ activeView, setActiveView, indicationFilter }) => (
  <div className="w-56 bg-gray-900 border-r border-gray-800 p-6 space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">NGS Intel v3</h1>
      <p className="text-sm text-gray-400">Market Intelligence Platform</p>
    </div>

    <nav className="space-y-2">
      {['Dashboard', 'Products', 'Vendors', 'Compare', 'Compatibility', 'Regulatory', 'Timeline', 'Data Quality'].map((view) => (
        <button
          key={view}
          onClick={() => setActiveView(view.toLowerCase())}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeView === view.toLowerCase()
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          {view}
        </button>
      ))}
    </nav>

    {indicationFilter.length > 0 && (
      <div className="pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-400 mb-2">Active Filter:</p>
        <div className="flex flex-wrap gap-1">
          {indicationFilter.map(key => {
            const ind = INDICATIONS.find(i => i.key === key);
            return (
              <span
                key={key}
                className="text-xs px-2 py-1 rounded bg-gray-800"
                style={{ color: ind?.color }}
              >
                {ind?.icon} {ind?.label}
              </span>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

const SAMPLE_TYPE_LABELS = { ffpe: 'FFPE', blood: 'Blood', cfdna: 'cfDNA', tissue: 'Tissue', saliva: 'Saliva' };
const NUCLEIC_ACID_LABELS = { dna: 'DNA', rna: 'RNA' };

const GrowthBadge = ({ growth }) => {
  if (!growth) return null;
  const styles = {
    growing: { bg: 'bg-green-900/50', text: 'text-green-400', icon: <TrendingUp className="w-3 h-3" /> },
    stable: { bg: 'bg-gray-700/50', text: 'text-gray-400', icon: <ArrowRight className="w-3 h-3" /> },
    declining: { bg: 'bg-red-900/50', text: 'text-red-400', icon: <TrendingDown className="w-3 h-3" /> },
    emerging: { bg: 'bg-blue-900/50', text: 'text-blue-400', icon: <Zap className="w-3 h-3" /> },
  };
  const s = styles[growth] || styles.stable;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${s.bg} ${s.text}`}>
      {s.icon} {growth.charAt(0).toUpperCase() + growth.slice(1)}
    </span>
  );
};

const RegionalShareBar = ({ regionalShare }) => {
  if (!regionalShare) return null;
  const regions = [
    { key: 'na', label: 'NA', color: '#ef4444' },
    { key: 'we', label: 'WE', color: '#10b981' },
    { key: 'hg', label: 'HG', color: '#f59e0b' },
    { key: 'od', label: 'OD', color: '#8b5cf6' },
  ];
  return (
    <div className="flex items-center gap-1 mt-1">
      {regions.map(r => (
        <div key={r.key} className="flex items-center gap-0.5" title={`${r.label}: ${regionalShare[r.key] || 0}%`}>
          <div className="w-8 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (regionalShare[r.key] || 0) * 2.5)}%`, backgroundColor: r.color }} />
          </div>
          <span className="text-[10px] text-gray-500">{regionalShare[r.key] || 0}</span>
        </div>
      ))}
    </div>
  );
};

const ProductCard = ({ product, indicationFilter }) => {
  const productIndications = product.indications || [];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-white text-sm">{product.name}</h3>
          <p className="text-xs text-gray-400">{product.category}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${getTier(product) === 1 ? 'bg-green-900 text-green-200' : getTier(product) === 2 ? 'bg-yellow-900 text-yellow-200' : 'bg-gray-700 text-gray-200'}`}>
          {product.tier}
        </span>
      </div>

      {/* Growth + Sample + Nucleic badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        <GrowthBadge growth={product.growth} />
        {(product.sampleTypes || []).map(st => (
          <span key={st} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400">{SAMPLE_TYPE_LABELS[st] || st}</span>
        ))}
        {(product.nucleicAcids || []).map(na => (
          <span key={na} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-400">{NUCLEIC_ACID_LABELS[na] || na}</span>
        ))}
      </div>

      {productIndications.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {productIndications.map(indKey => {
            const ind = INDICATIONS.find(i => i.key === indKey);
            return (
              <span
                key={indKey}
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: `${ind?.color}33`,
                  color: ind?.color
                }}
              >
                {ind?.icon} {ind?.label}
              </span>
            );
          })}
        </div>
      )}

      <div className="space-y-2 text-xs text-gray-300">
        {product.share !== undefined && (
          <div className="flex justify-between">
            <span>Market Share:</span>
            <span className="font-bold text-white">
              {product.share}%
              <ConfidenceDot conf={product.confidence?.share} />
            </span>
          </div>
        )}
        {product.pricing !== undefined && product.pricing !== 0 && (
          <div className="flex justify-between">
            <span>Cost/Sample:</span>
            <span className="font-bold text-white">
              ${product.pricing}
              <ConfidenceDot conf={product.confidence?.pricing} />
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Regulatory:</span>
          <span className={`font-bold px-2 py-1 rounded text-xs ${getRegulatoryBadge(product.regulatory)}`}>
            {product.regulatory}
            <ConfidenceDot conf={product.confidence?.regulatory} />
          </span>
        </div>
        {product.regionalShare && (
          <div>
            <span className="text-gray-500 text-[10px]">Regional Share:</span>
            <RegionalShareBar regionalShare={product.regionalShare} />
          </div>
        )}
      </div>
    </div>
  );
};

const MarketShareByCategory = ({ products }) => {
  const data = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catProducts = products.filter(p => p.category === cat);
      const tierA = catProducts.filter(p => p.tier === 'A');
      const tierB = catProducts.filter(p => p.tier === 'B');
      const tierC = catProducts.filter(p => p.tier === 'C');
      return {
        category: cat,
        'Tier A (Leaders)': tierA.reduce((s, p) => s + (p.share || 0), 0),
        'Tier B (Contenders)': tierB.reduce((s, p) => s + (p.share || 0), 0),
        'Tier C (Emerging)': tierC.reduce((s, p) => s + (p.share || 0), 0),
        products: catProducts.length,
      };
    });
  }, [products]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="category" stroke="#9ca3af" fontSize={12} />
        <YAxis stroke="#9ca3af" label={{ value: 'Combined Share %', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
        <Legend />
        <Bar dataKey="Tier A (Leaders)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Tier B (Contenders)" stackId="a" fill="#3b82f6" />
        <Bar dataKey="Tier C (Emerging)" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const TopVendorsBubble = ({ products }) => {
  const data = useMemo(() => {
    const vendorMap = {};
    products.forEach(p => {
      if (!vendorMap[p.vendor]) {
        const v = VENDORS.find(v => v.key === p.vendor);
        vendorMap[p.vendor] = { vendor: v?.label || p.vendor, totalShare: 0, products: 0, color: v?.color || '#6b7280', categories: new Set() };
      }
      vendorMap[p.vendor].totalShare += (p.share || 0);
      vendorMap[p.vendor].products++;
      vendorMap[p.vendor].categories.add(p.category);
    });
    return Object.values(vendorMap)
      .map(v => ({ ...v, categories: v.categories.size, label: `${v.vendor} (${v.products})` }))
      .sort((a, b) => b.totalShare - a.totalShare)
      .slice(0, 12);
  }, [products]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis type="number" stroke="#9ca3af" label={{ value: 'Total Share %', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 11 }} />
        <YAxis dataKey="vendor" type="category" stroke="#9ca3af" width={140} fontSize={11} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
          formatter={(val, name, entry) => [`${val}% across ${entry.payload.products} products in ${entry.payload.categories} categories`, 'Combined Share']}
        />
        <Bar dataKey="totalShare" radius={[0, 6, 6, 0]}>
          {data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const SequencerLandscape = ({ products }) => {
  const data = useMemo(() => {
    return products
      .filter(p => p.category === 'Sequencing')
      .map(p => {
        const v = VENDORS.find(v => v.key === p.vendor);
        return { name: p.name, share: p.share || 0, pricing: p.pricing || 0, vendor: v?.label || p.vendor, color: v?.color || '#6b7280', tier: p.tier, regulatory: p.regulatory };
      });
  }, [products]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="pricing" stroke="#9ca3af" name="Price" unit="" label={{ value: 'Cost per Sample ($)', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 11 }} />
        <YAxis dataKey="share" stroke="#9ca3af" name="Share" unit="%" label={{ value: 'Market Share %', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
          formatter={(val, name) => [name === 'Price' ? `$${val}` : `${val}%`, name]}
          labelFormatter={() => ''}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm">
                <p className="font-bold text-white">{d.name}</p>
                <p className="text-gray-400">{d.vendor} · Tier {d.tier}</p>
                <p className="text-blue-400">Share: {d.share}% · Cost: ${d.pricing}/sample</p>
                <p className="text-green-400">{d.regulatory}</p>
              </div>
            );
          }}
        />
        <Scatter data={data} shape="circle">
          {data.map((entry, idx) => <Cell key={idx} fill={entry.color} r={Math.max(5, entry.share)} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

const RegionalDistribution = ({ products }) => {
  const data = useMemo(() => {
    const regions = [
      { key: 'na', label: 'North America', color: '#ef4444' },
      { key: 'we', label: 'Western Europe', color: '#10b981' },
      { key: 'hg', label: 'High-Growth', color: '#f59e0b' },
      { key: 'od', label: 'Other Dev.', color: '#8b5cf6' },
    ];
    return CATEGORIES.map(cat => {
      const catProducts = products.filter(p => p.category === cat && p.regionalShare);
      const entry = { category: cat };
      regions.forEach(r => {
        entry[r.label] = catProducts.length > 0
          ? Math.round(catProducts.reduce((s, p) => s + (p.regionalShare[r.key] || 0), 0) / catProducts.length)
          : 0;
      });
      return entry;
    });
  }, [products]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="category" stroke="#9ca3af" fontSize={12} />
        <YAxis stroke="#9ca3af" label={{ value: 'Avg Regional Share %', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
        <Legend />
        <Bar dataKey="North America" fill="#ef4444" />
        <Bar dataKey="Western Europe" fill="#10b981" />
        <Bar dataKey="High-Growth" fill="#f59e0b" />
        <Bar dataKey="Other Dev." fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const GrowthDistribution = ({ products }) => {
  const data = useMemo(() => {
    const counts = { growing: 0, stable: 0, declining: 0, emerging: 0 };
    products.forEach(p => { if (p.growth) counts[p.growth]++; });
    return [
      { name: 'Growing', value: counts.growing, color: '#10b981' },
      { name: 'Stable', value: counts.stable, color: '#6b7280' },
      { name: 'Declining', value: counts.declining, color: '#ef4444' },
      { name: 'Emerging', value: counts.emerging, color: '#3b82f6' },
    ].filter(d => d.value > 0);
  }, [products]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
          {data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const SampleTypeBreakdown = ({ products }) => {
  const data = useMemo(() => {
    const stCounts = {};
    products.forEach(p => {
      (p.sampleTypes || []).forEach(st => {
        stCounts[st] = (stCounts[st] || 0) + 1;
      });
    });
    const colors = { ffpe: '#f59e0b', blood: '#ef4444', cfdna: '#3b82f6', tissue: '#10b981', saliva: '#a855f7' };
    return Object.entries(stCounts).map(([key, value]) => ({
      name: SAMPLE_TYPE_LABELS[key] || key,
      value,
      color: colors[key] || '#6b7280',
    })).sort((a, b) => b.value - a.value);
  }, [products]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
        <YAxis stroke="#9ca3af" label={{ value: 'Product Count', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ============================================
// VIEWS
// ============================================

const DashboardView = ({ products, indicationFilter }) => {
  const filteredProducts = useMemo(() => {
    return indicationFilter.length > 0
      ? products.filter(p => p.indications?.some(ind => indicationFilter.includes(ind)))
      : products;
  }, [products, indicationFilter]);

  const stats = [
    { label: 'Total Products', value: filteredProducts.length, icon: <Package className="w-6 h-6" /> },
    { label: 'Total Vendors', value: new Set(filteredProducts.map(p => p.vendor)).size, icon: <Users className="w-6 h-6" /> },
    { label: 'Indications', value: INDICATIONS.length, icon: <Zap className="w-6 h-6" /> },
    { label: 'Avg Market Share', value: (filteredProducts.reduce((s, p) => s + (p.share || 0), 0) / filteredProducts.length).toFixed(1) + '%', icon: <Globe className="w-6 h-6" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <button
          onClick={() => generateBrief(filteredProducts)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Export Brief
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className="text-gray-600">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Market Share by Category & Tier</h2>
          <MarketShareByCategory products={filteredProducts} />
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Top Vendors by Combined Share</h2>
          <TopVendorsBubble products={filteredProducts} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold text-white mb-4">Sequencer Landscape: Share vs. Cost</h2>
        <p className="text-gray-500 text-xs mb-3">Bubble size = market share. Hover for details.</p>
        <SequencerLandscape products={filteredProducts} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Regional Distribution by Category</h2>
          <p className="text-gray-500 text-xs mb-3">Average regional share across products in each workflow step.</p>
          <RegionalDistribution products={filteredProducts} />
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Growth Trajectory</h2>
          <p className="text-gray-500 text-xs mb-3">Product count by growth status.</p>
          <GrowthDistribution products={filteredProducts} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold text-white mb-4">Sample Type Coverage</h2>
        <p className="text-gray-500 text-xs mb-3">Number of products supporting each sample type.</p>
        <SampleTypeBreakdown products={filteredProducts} />
      </div>

      <IndicationHeatmap products={filteredProducts} />
    </div>
  );
};

const ProductsView = ({ products, indicationFilter }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('tier');
  const [viewStyle, setViewStyle] = useState('grid'); // 'grid' or 'table'
  const [selectedSampleTypes, setSelectedSampleTypes] = useState([]);
  const [selectedNucleicAcids, setSelectedNucleicAcids] = useState([]);

  const baseProducts = useMemo(() => {
    return indicationFilter.length > 0
      ? products.filter(p => p.indications?.some(ind => indicationFilter.includes(ind)))
      : products;
  }, [products, indicationFilter]);

  const filteredProducts = useMemo(() => {
    let result = baseProducts;
    if (selectedCategories.length > 0) result = result.filter(p => selectedCategories.includes(p.category));
    if (selectedVendors.length > 0) result = result.filter(p => selectedVendors.includes(p.vendor));
    if (selectedSampleTypes.length > 0) result = result.filter(p => (p.sampleTypes || []).some(st => selectedSampleTypes.includes(st)));
    if (selectedNucleicAcids.length > 0) result = result.filter(p => (p.nucleicAcids || []).some(na => selectedNucleicAcids.includes(na)));
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (VENDORS.find(v => v.key === p.vendor)?.label || '').toLowerCase().includes(q));
    }
    if (sortField === 'tier') result = [...result].sort((a, b) => getTier(a) - getTier(b) || (b.share || 0) - (a.share || 0));
    else if (sortField === 'share') result = [...result].sort((a, b) => (b.share || 0) - (a.share || 0));
    else if (sortField === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortField === 'pricing') result = [...result].sort((a, b) => (b.pricing || 0) - (a.pricing || 0));
    return result;
  }, [baseProducts, selectedCategories, selectedVendors, selectedSampleTypes, selectedNucleicAcids, searchText, sortField]);

  const availableVendors = useMemo(() => {
    const vKeys = [...new Set(baseProducts.filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category)).map(p => p.vendor))];
    return VENDORS.filter(v => vKeys.includes(v.key)).sort((a, b) => a.label.localeCompare(b.label));
  }, [baseProducts, selectedCategories]);

  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const toggleVendor = (key) => setSelectedVendors(prev => prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key]);

  const groupedByCategory = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach(cat => { groups[cat] = filteredProducts.filter(p => p.category === cat); });
    return groups;
  }, [filteredProducts]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{filteredProducts.length} of {baseProducts.length} products</span>
          <div className="flex bg-gray-900 rounded-lg p-0.5">
            <button onClick={() => setViewStyle('grid')} className={`px-3 py-1 rounded text-xs font-medium ${viewStyle === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Grid</button>
            <button onClick={() => setViewStyle('table')} className={`px-3 py-1 rounded text-xs font-medium ${viewStyle === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Table</button>
          </div>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3">
        <input
          type="text" placeholder="Search products or vendors..."
          value={searchText} onChange={e => setSearchText(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <select value={sortField} onChange={e => setSortField(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="tier">Sort: Tier</option>
          <option value="share">Sort: Share</option>
          <option value="pricing">Sort: Price</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Workflow Step Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const count = baseProducts.filter(p => p.category === cat && (selectedVendors.length === 0 || selectedVendors.includes(p.vendor))).length;
          return (
            <button key={cat} onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategories.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>
              {cat} <span className="text-gray-400 ml-1">({count})</span>
            </button>
          );
        })}
        {selectedCategories.length > 0 && <button onClick={() => setSelectedCategories([])} className="text-xs text-blue-400 hover:text-blue-300 ml-1">Clear</button>}
      </div>

      {/* Vendor Filter */}
      <div className="flex flex-wrap gap-1.5">
        {availableVendors.map(v => (
          <button key={v.key} onClick={() => toggleVendor(v.key)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedVendors.includes(v.key) ? 'text-white ring-1 ring-white' : 'text-gray-300 hover:text-white'}`}
            style={{ backgroundColor: selectedVendors.includes(v.key) ? v.color : `${v.color}22` }}>
            {v.label}
          </button>
        ))}
        {selectedVendors.length > 0 && <button onClick={() => setSelectedVendors([])} className="text-xs text-blue-400 hover:text-blue-300 ml-1">Clear</button>}
      </div>

      {/* Sample Type + Nucleic Acid Filters */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sample:</span>
          {Object.entries(SAMPLE_TYPE_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setSelectedSampleTypes(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedSampleTypes.includes(key) ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}>
              {label}
            </button>
          ))}
          {selectedSampleTypes.length > 0 && <button onClick={() => setSelectedSampleTypes([])} className="text-xs text-purple-400 hover:text-purple-300">Clear</button>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Nucleic Acid:</span>
          {Object.entries(NUCLEIC_ACID_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setSelectedNucleicAcids(prev => prev.includes(key) ? prev.filter(n => n !== key) : [...prev, key])}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedNucleicAcids.includes(key) ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}>
              {label}
            </button>
          ))}
          {selectedNucleicAcids.length > 0 && <button onClick={() => setSelectedNucleicAcids([])} className="text-xs text-cyan-400 hover:text-cyan-300">Clear</button>}
        </div>
      </div>

      {/* Content */}
      {viewStyle === 'grid' ? (
        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const catProducts = groupedByCategory[category];
            if (catProducts.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">{category} <span className="text-sm font-normal text-gray-500">({catProducts.length})</span></h3>
                <div className="grid grid-cols-3 gap-3">
                  {catProducts.map(product => <ProductCard key={product.id} product={product} indicationFilter={indicationFilter} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="px-4 py-3 text-gray-300 font-medium">Product</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Vendor</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Step</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Tier</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Share</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Price</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Regulatory</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Growth</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Samples</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => {
                const v = VENDORS.find(v => v.key === p.vendor);
                return (
                  <tr key={p.id} className={`border-b border-gray-700/50 ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'} hover:bg-gray-700/50`}>
                    <td className="px-4 py-2 text-white font-medium">{p.name}</td>
                    <td className="px-4 py-2"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: v?.color }}></span><span className="text-gray-300">{v?.label}</span></span></td>
                    <td className="px-4 py-2 text-gray-400">{p.category}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${p.tier === 'A' ? 'bg-green-900/50 text-green-300' : p.tier === 'B' ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>{p.tier}</span></td>
                    <td className="px-4 py-2 text-white font-mono">{p.share}%</td>
                    <td className="px-4 py-2 text-gray-300 font-mono">{p.pricing > 0 ? `$${p.pricing.toLocaleString()}` : 'Service'}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs ${getRegulatoryBadge(p.regulatory)}`}>{p.regulatory}</span></td>
                    <td className="px-4 py-2"><GrowthBadge growth={p.growth} /></td>
                    <td className="px-4 py-2"><div className="flex gap-0.5">{(p.sampleTypes || []).map(st => <span key={st} className="text-[10px] px-1 py-0.5 rounded bg-purple-900/30 text-purple-400">{SAMPLE_TYPE_LABELS[st] || st}</span>)}{(p.nucleicAcids || []).map(na => <span key={na} className="text-[10px] px-1 py-0.5 rounded bg-cyan-900/30 text-cyan-400">{na.toUpperCase()}</span>)}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const VendorsView = ({ products, indicationFilter }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [sortField, setSortField] = useState('share');

  const baseProducts = useMemo(() => {
    return indicationFilter.length > 0
      ? products.filter(p => p.indications?.some(ind => indicationFilter.includes(ind)))
      : products;
  }, [products, indicationFilter]);

  const filteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) return baseProducts;
    return baseProducts.filter(p => selectedCategories.includes(p.category));
  }, [baseProducts, selectedCategories]);

  const vendorStats = useMemo(() => {
    return VENDORS.map(vendor => {
      const vendorProds = filteredProducts.filter(p => p.vendor === vendor.key);
      const categories = [...new Set(vendorProds.map(p => p.category))];
      const tierCounts = { A: 0, B: 0, C: 0 };
      vendorProds.forEach(p => { if (tierCounts[p.tier] !== undefined) tierCounts[p.tier]++; });
      const regulatoryCounts = {};
      vendorProds.forEach(p => { regulatoryCounts[p.regulatory] = (regulatoryCounts[p.regulatory] || 0) + 1; });
      return {
        ...vendor,
        products: vendorProds.length,
        productList: vendorProds,
        totalShare: vendorProds.reduce((s, p) => s + (p.share || 0), 0),
        avgPricing: vendorProds.length > 0 ? Math.round(vendorProds.reduce((s, p) => s + (p.pricing || 0), 0) / vendorProds.length) : 0,
        categories,
        tierCounts,
        regulatoryCounts,
      };
    }).filter(v => {
      if (v.products === 0) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        return v.label.toLowerCase().includes(q) || v.strength.toLowerCase().includes(q) || v.weakness.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      if (sortField === 'share') return b.totalShare - a.totalShare;
      if (sortField === 'products') return b.products - a.products;
      if (sortField === 'name') return a.label.localeCompare(b.label);
      return b.totalShare - a.totalShare;
    });
  }, [filteredProducts, searchText, sortField]);

  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Vendors</h2>
        <span className="text-sm text-gray-400">{vendorStats.length} vendors</span>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3">
        <input type="text" placeholder="Search vendors, strengths, weaknesses..."
          value={searchText} onChange={e => setSearchText(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
        <select value={sortField} onChange={e => setSortField(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="share">Sort: Total Share</option>
          <option value="products">Sort: Product Count</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Workflow Step Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const count = new Set(baseProducts.filter(p => p.category === cat).map(p => p.vendor)).size;
          return (
            <button key={cat} onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategories.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>
              {cat} <span className="text-gray-400 ml-1">({count} vendors)</span>
            </button>
          );
        })}
        {selectedCategories.length > 0 && <button onClick={() => setSelectedCategories([])} className="text-xs text-blue-400 hover:text-blue-300 ml-1">Clear</button>}
      </div>

      {/* Vendor Cards */}
      <div className="space-y-4">
        {vendorStats.map(vendor => {
          const isExpanded = expandedVendor === vendor.key;
          return (
            <div key={vendor.key} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: vendor.color + '20' }}>
                      <span className="text-lg font-bold" style={{ color: vendor.color }}>{vendor.label.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{vendor.label}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400">{vendor.products} products</span>
                        <span className="text-xs text-gray-600">|</span>
                        <span className="text-xs text-blue-400 font-mono">{vendor.totalShare}% combined share</span>
                        {vendor.avgPricing > 0 && <>
                          <span className="text-xs text-gray-600">|</span>
                          <span className="text-xs text-gray-400">Avg ${vendor.avgPricing.toLocaleString()}</span>
                        </>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {vendor.categories.map(cat => (
                      <span key={cat} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">{cat}</span>
                    ))}
                  </div>
                </div>

                {/* Tier + Regulatory summary */}
                <div className="flex items-center gap-4 mb-3">
                  {['A', 'B', 'C'].map(t => vendor.tierCounts[t] > 0 && (
                    <span key={t} className={`text-xs px-2 py-0.5 rounded ${t === 'A' ? 'bg-green-900/40 text-green-400' : t === 'B' ? 'bg-blue-900/40 text-blue-400' : 'bg-gray-700/40 text-gray-400'}`}>
                      Tier {t}: {vendor.tierCounts[t]}
                    </span>
                  ))}
                  <span className="text-gray-700">|</span>
                  {Object.entries(vendor.regulatoryCounts).map(([reg, count]) => (
                    <span key={reg} className={`text-xs px-2 py-0.5 rounded ${getRegulatoryBadge(reg)}`}>{reg} ({count})</span>
                  ))}
                </div>

                {/* SWOT Row */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-green-500 font-semibold mb-1">Strength</p>
                    <p className="text-gray-300 text-xs">{vendor.strength}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 font-semibold mb-1">Weakness</p>
                    <p className="text-gray-300 text-xs">{vendor.weakness}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400 font-semibold mb-1">Recent Move</p>
                    <p className="text-gray-300 text-xs">{vendor.recentMove}</p>
                  </div>
                </div>

                {/* Expand/collapse */}
                <button onClick={() => setExpandedVendor(isExpanded ? null : vendor.key)}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {isExpanded ? 'Hide products' : `Show ${vendor.products} products`}
                </button>
              </div>

              {/* Expanded product list */}
              {isExpanded && (
                <div className="border-t border-gray-700 bg-gray-900/50">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="px-4 py-2 text-left text-gray-400 font-medium">Product</th>
                        <th className="px-4 py-2 text-left text-gray-400 font-medium">Step</th>
                        <th className="px-4 py-2 text-left text-gray-400 font-medium">Tier</th>
                        <th className="px-4 py-2 text-left text-gray-400 font-medium">Share</th>
                        <th className="px-4 py-2 text-left text-gray-400 font-medium">Price</th>
                        <th className="px-4 py-2 text-left text-gray-400 font-medium">Regulatory</th>
                        <th className="px-4 py-2 text-left text-gray-400 font-medium">Growth</th>
                        <th className="px-4 py-2 text-left text-gray-400 font-medium">Indications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendor.productList.sort((a, b) => getTier(a) - getTier(b) || (b.share || 0) - (a.share || 0)).map((p, i) => (
                        <tr key={p.id} className={`${i % 2 === 0 ? '' : 'bg-gray-900/30'} hover:bg-gray-700/30`}>
                          <td className="px-4 py-2 text-white font-medium">{p.name}</td>
                          <td className="px-4 py-2 text-gray-400">{p.category}</td>
                          <td className="px-4 py-2"><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${p.tier === 'A' ? 'bg-green-900/50 text-green-300' : p.tier === 'B' ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>{p.tier}</span></td>
                          <td className="px-4 py-2 text-white font-mono">{p.share}%</td>
                          <td className="px-4 py-2 text-gray-300 font-mono">{p.pricing > 0 ? `$${p.pricing.toLocaleString()}` : 'Service'}</td>
                          <td className="px-4 py-2"><span className={`px-1.5 py-0.5 rounded text-xs ${getRegulatoryBadge(p.regulatory)}`}>{p.regulatory}</span></td>
                          <td className="px-4 py-2"><GrowthBadge growth={p.growth} /></td>
                          <td className="px-4 py-2"><div className="flex gap-0.5">{(p.indications || []).slice(0, 4).map(ind => {
                            const indObj = INDICATIONS.find(i => i.key === ind);
                            return <span key={ind} title={indObj?.label}>{indObj?.icon}</span>;
                          })}{(p.indications || []).length > 4 && <span className="text-gray-500">+{p.indications.length - 4}</span>}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CompareView = ({ products, indicationFilter }) => {
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortField, setSortField] = useState('share');
  const [sortDir, setSortDir] = useState('desc');

  const allProducts = useMemo(() => {
    return indicationFilter.length > 0
      ? products.filter(p => p.indications?.some(ind => indicationFilter.includes(ind)))
      : products;
  }, [products, indicationFilter]);

  // Derive available vendors/categories from current product set
  const availableVendors = useMemo(() => {
    const vKeys = [...new Set(allProducts.map(p => p.vendor))];
    return VENDORS.filter(v => vKeys.includes(v.key)).sort((a, b) => a.label.localeCompare(b.label));
  }, [allProducts]);

  const availableCategories = useMemo(() => {
    return [...new Set(allProducts.map(p => p.category))];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (selectedVendors.length > 0) result = result.filter(p => selectedVendors.includes(p.vendor));
    if (selectedCategories.length > 0) result = result.filter(p => selectedCategories.includes(p.category));
    result = [...result].sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [allProducts, selectedVendors, selectedCategories, sortField, sortDir]);

  const toggleVendor = (key) => setSelectedVendors(prev => prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key]);
  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const SortIcon = ({ field }) => sortField === field ? <span className="ml-1 text-blue-400">{sortDir === 'desc' ? '▼' : '▲'}</span> : <span className="ml-1 text-gray-600">▼</span>;

  // Chart data: grouped by vendor for selected products
  const vendorChartData = useMemo(() => {
    const map = {};
    filteredProducts.forEach(p => {
      const v = VENDORS.find(v => v.key === p.vendor);
      if (!map[p.vendor]) map[p.vendor] = { vendor: v?.label || p.vendor, color: v?.color || '#6b7280', share: 0, products: 0, avgPrice: 0, totalPrice: 0 };
      map[p.vendor].share += (p.share || 0);
      map[p.vendor].products++;
      map[p.vendor].totalPrice += (p.pricing || 0);
    });
    return Object.values(map).map(v => ({ ...v, avgPrice: v.products > 0 ? Math.round(v.totalPrice / v.products) : 0 })).sort((a, b) => b.share - a.share);
  }, [filteredProducts]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Compare Products</h2>

      {/* Filter Controls */}
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">Filter by Workflow Step</h3>
            {selectedCategories.length > 0 && <button onClick={() => setSelectedCategories([])} className="text-xs text-blue-400 hover:text-blue-300">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(cat => (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategories.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                {cat} <span className="text-gray-400 ml-1">({allProducts.filter(p => p.category === cat && (selectedVendors.length === 0 || selectedVendors.includes(p.vendor))).length})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">Filter by Vendor</h3>
            {selectedVendors.length > 0 && <button onClick={() => setSelectedVendors([])} className="text-xs text-blue-400 hover:text-blue-300">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableVendors.map(v => (
              <button key={v.key} onClick={() => toggleVendor(v.key)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedVendors.includes(v.key) ? 'text-white ring-1 ring-white' : 'text-gray-300 hover:text-white'}`}
                style={{ backgroundColor: selectedVendors.includes(v.key) ? v.color : `${v.color}33` }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Products', value: filteredProducts.length },
          { label: 'Vendors', value: new Set(filteredProducts.map(p => p.vendor)).size },
          { label: 'Avg Share', value: filteredProducts.length > 0 ? (filteredProducts.reduce((s, p) => s + (p.share || 0), 0) / filteredProducts.length).toFixed(1) + '%' : '—' },
          { label: 'FDA/CE-IVD', value: filteredProducts.filter(p => ['CE-IVD', 'FDA 510(k)'].includes(p.regulatory)).length },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      {vendorChartData.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-3">Combined Share by Vendor</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, vendorChartData.length * 32)}>
              <BarChart data={vendorChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="vendor" type="category" stroke="#9ca3af" width={130} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(val) => [`${val}%`, 'Share']} />
                <Bar dataKey="share" radius={[0, 6, 6, 0]}>
                  {vendorChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-3">Share vs. Price</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, vendorChartData.length * 32)}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="avgPrice" stroke="#9ca3af" name="Avg Price" label={{ value: 'Avg Price ($)', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 11 }} />
                <YAxis dataKey="share" stroke="#9ca3af" name="Share" label={{ value: 'Combined Share %', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (<div className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs">
                      <p className="font-bold text-white">{d.vendor}</p>
                      <p className="text-blue-400">Share: {d.share}% · Avg Price: ${d.avgPrice.toLocaleString()}</p>
                      <p className="text-gray-400">{d.products} products</p>
                    </div>);
                  }} />
                <Scatter data={vendorChartData}>
                  {vendorChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} r={Math.max(6, Math.sqrt(entry.share) * 3)} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="px-4 py-3 text-gray-300 font-medium">Product</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Vendor</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Category</th>
                <th className="px-4 py-3 text-gray-300 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('tier')}>Tier<SortIcon field="tier" /></th>
                <th className="px-4 py-3 text-gray-300 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('share')}>Share %<SortIcon field="share" /></th>
                <th className="px-4 py-3 text-gray-300 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('pricing')}>Price<SortIcon field="pricing" /></th>
                <th className="px-4 py-3 text-gray-300 font-medium">Regulatory</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Growth</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Samples</th>
                <th className="px-4 py-3 text-gray-300 font-medium">Indications</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => {
                const v = VENDORS.find(v => v.key === p.vendor);
                return (
                  <tr key={p.id} className={`border-b border-gray-700/50 ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'} hover:bg-gray-700/50`}>
                    <td className="px-4 py-2.5 text-white font-medium">{p.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v?.color || '#6b7280' }}></span>
                        <span className="text-gray-300">{v?.label || p.vendor}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-400">{p.category}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.tier === 'A' ? 'bg-green-900/50 text-green-300' : p.tier === 'B' ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>{p.tier}</span>
                    </td>
                    <td className="px-4 py-2.5 text-white font-mono">{p.share || 0}%</td>
                    <td className="px-4 py-2.5 text-gray-300 font-mono">{p.pricing > 0 ? `$${p.pricing.toLocaleString()}` : 'Service'}</td>
                    <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-xs ${getRegulatoryBadge(p.regulatory)}`}>{p.regulatory}</span></td>
                    <td className="px-4 py-2.5"><GrowthBadge growth={p.growth} /></td>
                    <td className="px-4 py-2.5"><div className="flex gap-0.5">{(p.sampleTypes || []).map(st => <span key={st} className="text-[10px] px-1 py-0.5 rounded bg-purple-900/30 text-purple-400">{SAMPLE_TYPE_LABELS[st] || st}</span>)}{(p.nucleicAcids || []).map(na => <span key={na} className="text-[10px] px-1 py-0.5 rounded bg-cyan-900/30 text-cyan-400">{na.toUpperCase()}</span>)}</div></td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">{(p.indications || []).slice(0, 3).map(ind => {
                        const indObj = INDICATIONS.find(i => i.key === ind);
                        return <span key={ind} className="text-xs" title={indObj?.label}>{indObj?.icon}</span>;
                      })}{(p.indications || []).length > 3 && <span className="text-xs text-gray-500">+{p.indications.length - 3}</span>}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && <div className="p-8 text-center text-gray-500">Select vendors or workflow steps above to compare products</div>}
      </div>
    </div>
  );
};

const RegulatoryView = ({ products, indicationFilter }) => {
  const filteredProducts = useMemo(() => {
    return indicationFilter.length > 0
      ? products.filter(p => p.indications?.some(ind => indicationFilter.includes(ind)))
      : products;
  }, [products, indicationFilter]);

  const regulatoryGroups = useMemo(() => {
    const groups = {};
    filteredProducts.forEach(p => {
      if (!groups[p.regulatory]) groups[p.regulatory] = [];
      groups[p.regulatory].push(p);
    });
    return groups;
  }, [filteredProducts]);

  return (
    <div className="space-y-4">
      {Object.entries(regulatoryGroups).map(([regulatory, prods]) => (
        <div key={regulatory} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-3">
            <span className={`px-3 py-1 rounded text-sm font-bold ${getRegulatoryBadge(regulatory)}`}>
              {regulatory}
              <ConfidenceDot conf={prods[0]?.confidence?.regulatory} />
            </span>
            <span className="ml-3 text-sm text-gray-400">{prods.length} products</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            {prods.map(p => (
              <div key={p.id} className="bg-gray-900 px-3 py-2 rounded">
                {p.name} <span className="text-gray-500">({p.vendor})</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const TimelineView = ({ products, indicationFilter }) => {
  return (
    <div className="space-y-3">
      {TIMELINE_EVENTS.map((event, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-start gap-4">
          <div className="text-right min-w-16">
            <p className="text-xl font-bold text-blue-400">{event.year}</p>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{event.event}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 capitalize">{event.vendor}</span>
              {getGrowthIcon(event.impact)}
              <span className="text-xs text-gray-400">{event.impact} Impact</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CompatibilityView = ({ products }) => {
  const [selectedLayer, setSelectedLayer] = useState('ext_to_libprep');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'builder'
  const [hoveredCell, setHoveredCell] = useState(null);

  const currentLayer = COMPATIBILITY_LAYERS.find(l => l.key === selectedLayer);
  const layerData = useMemo(() => COMPATIBILITY.filter(c => c.layer === selectedLayer), [selectedLayer]);

  const sources = useMemo(() => [...new Set(layerData.map(c => c.source))].sort(), [layerData]);
  const targets = useMemo(() => [...new Set(layerData.map(c => c.target))].sort(), [layerData]);

  const matrixData = useMemo(() => {
    const matrix = {};
    sources.forEach(src => {
      matrix[src] = {};
      targets.forEach(tgt => {
        const entry = layerData.find(c => c.source === src && c.target === tgt);
        matrix[src][tgt] = entry || null;
      });
    });
    return matrix;
  }, [sources, targets, layerData]);

  const stats = useMemo(() => {
    const counts = { validated: 0, compatible: 0, theoretical: 0, incompatible: 0 };
    layerData.forEach(c => { counts[c.level] = (counts[c.level] || 0) + 1; });
    return counts;
  }, [layerData]);

  const totalStats = useMemo(() => {
    const counts = { validated: 0, compatible: 0, theoretical: 0, total: 0 };
    COMPATIBILITY.forEach(c => { counts[c.level] = (counts[c.level] || 0) + 1; counts.total++; });
    return counts;
  }, []);

  const getLevelColor = (level) => {
    const colors = {
      validated: { bg: 'rgba(16, 185, 129, 0.4)', border: '#10b981', text: 'text-green-400' },
      compatible: { bg: 'rgba(245, 158, 11, 0.3)', border: '#f59e0b', text: 'text-yellow-400' },
      theoretical: { bg: 'rgba(107, 114, 128, 0.2)', border: '#6b7280', text: 'text-gray-400' },
      incompatible: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: 'text-red-400' },
    };
    return colors[level] || { bg: '#1f2937', border: '#374151', text: 'text-gray-500' };
  };

  const getProduct = (id) => products.find(p => p.id === id);
  const getProductName = (id) => { const p = getProduct(id); return p ? p.name : id; };
  const getVendor = (id) => { const p = getProduct(id); return p ? VENDORS.find(v => v.key === p.vendor) : null; };

  if (viewMode === 'builder') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Compatibility</h2>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('matrix')} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm font-medium">Matrix View</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Builder View</button>
          </div>
        </div>
        <WorkflowBuilder products={products} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Compatibility</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Matrix View</button>
          <button onClick={() => setViewMode('builder')} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm font-medium">Builder View</button>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
          <p className="text-xs text-gray-400">Total Pairs</p>
          <p className="text-xl font-bold text-white">{totalStats.total}</p>
        </div>
        {['validated', 'compatible', 'theoretical'].map(level => (
          <div key={level} className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-xs text-gray-400 capitalize">{level}</p>
            <p className={`text-xl font-bold ${getLevelColor(level).text}`}>{totalStats[level]}</p>
          </div>
        ))}
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
          <p className="text-xs text-gray-400">5 Layers</p>
          <p className="text-xl font-bold text-blue-400">{COMPATIBILITY_LAYERS.length}</p>
        </div>
      </div>

      {/* Layer tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1 overflow-x-auto">
        {COMPATIBILITY_LAYERS.map(layer => {
          const layerCount = COMPATIBILITY.filter(c => c.layer === layer.key).length;
          return (
            <button
              key={layer.key}
              onClick={() => { setSelectedLayer(layer.key); setSelectedDetail(null); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedLayer === layer.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {layer.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedLayer === layer.key ? 'bg-blue-500' : 'bg-gray-700'}`}>{layerCount}</span>
            </button>
          );
        })}
      </div>

      {/* Layer stats */}
      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.4)' }}></span><span className="text-gray-400">Validated: {stats.validated}</span></span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.3)' }}></span><span className="text-gray-400">Compatible: {stats.compatible}</span></span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(107,114,128,0.2)', border: '1px solid #6b7280' }}></span><span className="text-gray-400">Theoretical: {stats.theoretical}</span></span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-400">{sources.length} sources × {targets.length} targets</span>
      </div>

      {/* Matrix */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <td className="w-40 h-24 p-2 sticky left-0 z-20 bg-gray-800">
                  <span className="text-xs text-gray-500 italic">{currentLayer?.source} →</span>
                </td>
                {targets.map(tgt => {
                  const v = getVendor(tgt);
                  return (
                    <td key={tgt} className="w-20 h-24 p-1 text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                      <span className="text-xs text-gray-300 break-words flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: v?.color || '#6b7280' }}></span>
                        {getProductName(tgt)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sources.map(src => {
                const v = getVendor(src);
                return (
                  <tr key={src}>
                    <td className="p-2 bg-gray-900 sticky left-0 z-10">
                      <span className="text-xs text-gray-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: v?.color || '#6b7280' }}></span>
                        {getProductName(src)}
                      </span>
                    </td>
                    {targets.map(tgt => {
                      const entry = matrixData[src]?.[tgt];
                      const levelColor = entry ? getLevelColor(entry.level) : { bg: '#111827', border: '#1f2937' };
                      const isHovered = hoveredCell?.src === src && hoveredCell?.tgt === tgt;
                      return (
                        <td
                          key={`${src}-${tgt}`}
                          className="w-20 h-12 p-0.5 cursor-pointer transition-all relative"
                          style={{ backgroundColor: levelColor.bg, borderWidth: '1px', borderColor: isHovered && entry ? '#fff' : levelColor.border }}
                          onClick={() => entry && setSelectedDetail(entry)}
                          onMouseEnter={() => setHoveredCell({ src, tgt })}
                          onMouseLeave={() => setHoveredCell(null)}
                          title={entry ? `${getProductName(src)} → ${getProductName(tgt)}: ${entry.level}` : ''}
                        >
                          {entry && (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-xs font-bold" style={{ color: levelColor.border }}>
                                {entry.level === 'validated' ? '✓' : entry.level === 'compatible' ? '~' : entry.level === 'theoretical' ? '?' : '✗'}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selectedDetail && (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg text-sm font-bold capitalize" style={{ backgroundColor: getLevelColor(selectedDetail.level).bg, color: getLevelColor(selectedDetail.level).border }}>
                {selectedDetail.level}
              </span>
              <span className="text-gray-500 text-sm">Pair Detail</span>
            </div>
            <button onClick={() => setSelectedDetail(null)} className="text-gray-500 hover:text-gray-300 text-sm">Close</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-3">
              <h3 className="text-xs text-gray-500 mb-1">Source ({currentLayer?.source})</h3>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getVendor(selectedDetail.source)?.color || '#6b7280' }}></span>
                <p className="text-white font-bold">{getProductName(selectedDetail.source)}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">{getVendor(selectedDetail.source)?.label}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <h3 className="text-xs text-gray-500 mb-1">Target ({currentLayer?.target})</h3>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getVendor(selectedDetail.target)?.color || '#6b7280' }}></span>
                <p className="text-white font-bold">{getProductName(selectedDetail.target)}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">{getVendor(selectedDetail.target)?.label}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Protocol / Reference</h3>
              <p className="text-white text-sm">{selectedDetail.protocol || 'No formal protocol documented'}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 mb-1">Notes</h3>
              <p className="text-white text-sm">{selectedDetail.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [indicationFilter, setIndicationFilter] = useState([]);

  const filteredProducts = useMemo(() => {
    return indicationFilter.length > 0
      ? PRODUCTS.filter(p => p.indications?.some(ind => indicationFilter.includes(ind)))
      : PRODUCTS;
  }, [indicationFilter]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'products':
        return <ProductsView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'vendors':
        return <VendorsView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'compare':
        return <CompareView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'compatibility':
        return <CompatibilityView products={filteredProducts} />;
      case 'regulatory':
        return <RegulatoryView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'timeline':
        return <TimelineView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'data quality':
        return <DataQualityView products={filteredProducts} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar activeView={activeView} setActiveView={setActiveView} indicationFilter={indicationFilter} />
      <main className="flex-1 p-8">
        <IndicationFilterBar indicationFilter={indicationFilter} setIndicationFilter={setIndicationFilter} />
        {renderView()}
      </main>
    </div>
  );
}
