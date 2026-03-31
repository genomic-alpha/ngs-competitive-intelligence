import React, { useState, useMemo, useCallback, createContext, useContext } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, RadarChart, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarAngleAxis, PolarGrid, PieChart, Pie, Cell, Area, AreaChart, ComposedChart, ReferenceLine } from 'recharts';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, TrendingUp, TrendingDown, ArrowRight, Users, Package, Zap, Globe, DollarSign, FileText, Calendar, Download } from 'lucide-react';

// ============================================
// SCENARIO CONTEXT
// ============================================

const ScenarioContext = createContext({ adjustments: {}, setAdjustments: () => {} });

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
// MULTI_OMICS_CATEGORIES (future): ['Proteomics', 'Spatial Biology', 'Long-Read Sequencing', 'Epigenomics', 'Single-Cell Multi-omics']

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
  { key: 'pillar', label: 'Pillar Biosciences', color: '#14b8a6', strength: 'SLIMamp proprietary multiplex PCR, FDA PMA-approved CDx', weakness: 'Small commercial team, limited global distribution', recentMove: 'oncoReveal CDx FDA PMA expanded indications (2024)' },
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
  { key: 'zymo', label: 'Zymo Research', color: '#22d3ee', strength: 'Quick-DNA/RNA co-extraction, cfDNA specialist, column + bead formats', weakness: 'No IVD-marked kits, limited automation integration', recentMove: 'Quick-cfDNA Serum & Plasma Kit v2, FFPE workflow optimization' },
  { key: 'macherey_nagel', label: 'Macherey-Nagel', color: '#a3e635', strength: 'NucleoMag bead automation, strong EU clinical lab presence', weakness: 'Limited US commercial footprint', recentMove: 'NucleoMag FFPE optimization, Hamilton/Tecan automation protocols' },
  { key: 'omega', label: 'Omega Bio-tek', color: '#fdba74', strength: 'Budget Mag-Bind kits, TotalPure NGS cleanup standard', weakness: 'Limited clinical validation, no IVD products', recentMove: 'Mag-Bind cfDNA Kit, high-growth market expansion' },
  { key: '10x', label: '10x Genomics', color: '#f472b6', strength: 'Chromium single-cell market leader, Visium spatial', weakness: 'Premium pricing, instrument lock-in', recentMove: 'Chromium X Series, GEM-X chemistry, Xenium spatial' },
  { key: 'natera', label: 'Natera', color: '#c4b5fd', strength: 'Signatera MRD personalized ctDNA, Panorama NIPT leader', weakness: 'Service model only, reimbursement dependent', recentMove: 'Signatera expanded indications, Medicare coverage' },
  { key: 'myriad', label: 'Myriad Genetics', color: '#fda4af', strength: 'myChoice CDx FDA-approved HRD, BRACAnalysis CDx', weakness: 'Service model, patent litigation history', recentMove: 'myChoice CDx expanded tumor types, Precise Oncology platform' },
  { key: 'integra', label: 'INTEGRA Biosciences', color: '#86efac', strength: 'MIRO CANVAS digital microfluidics, ASSIST PLUS versatility', weakness: 'Smaller install base vs Hamilton/Beckman', recentMove: 'MIRO CANVAS NGS workflows, ASSIST PLUS method library' },
  { key: 'sentieon', label: 'Sentieon', color: '#fde047', strength: 'GATK-compatible 10-50x faster, deterministic results', weakness: 'Commercial license required, less brand recognition', recentMove: 'DNAscope/TNscope updates, cloud deployment expansion' },
  { key: 'dnaxnexus', label: 'DNAnexus', color: '#67e8f9', strength: 'Enterprise cloud genomics, FDA-cleared Apollo platform', weakness: 'Premium enterprise pricing', recentMove: 'Apollo Informatics platform, UK Biobank partnership' },
  { key: 'emedgene', label: 'Emedgene (Illumina)', color: '#d8b4fe', strength: 'AI-driven rare disease interpretation, Illumina ecosystem', weakness: 'Rare disease focused, limited somatic', recentMove: 'Illumina acquisition integration, expanded gene panels' },
];

const PRODUCTS = [
  // EXTRACTION
  { id: 'qiagen-ffpe-ext', vendor: 'qiagen', name: 'QIAamp FFPE DNA', category: 'Extraction', tier: 'A', share: 15.1, pricing: 8, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:18,we:25,hg:17,od:22}, growth: "stable", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'qiagen-blood-ext', vendor: 'qiagen', name: 'QIAamp Blood', category: 'Extraction', tier: 'A', share: 12.2, pricing: 5, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:17,we:18,hg:12,od:14}, growth: "stable", indications: ["liquid_biopsy","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'promega-ffpe-ext', vendor: 'promega', name: 'Promega FFPE DNA', category: 'Extraction', tier: 'B', share: 7.2, pricing: 9, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:4,hg:5,od:6}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'promega-blood-ext', vendor: 'promega', name: 'Promega Blood DNA', category: 'Extraction', tier: 'B', share: 5, pricing: 5, regulatory: 'RUO', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:5,we:3,hg:2,od:3}, growth: "growing", indications: ["liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'roche-magna-ext', vendor: 'roche', name: 'Roche MagnaP', category: 'Extraction', tier: 'A', share: 13.7, pricing: 7, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:13,hg:9,od:12}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'thermo-magmax-ext', vendor: 'thermo', name: 'Thermo MagMAX', category: 'Extraction', tier: 'A', share: 12.9, pricing: 6, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:13,we:9,hg:10,od:9}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'beckman-ampure-ext', vendor: 'beckman', name: 'Beckman Ampure', category: 'Extraction', tier: 'B', share: 5.8, pricing: 3, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:4,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'zymo-ffpe-ext', vendor: 'zymo', name: 'Zymo Quick-DNA/RNA FFPE Kit', category: 'Extraction', tier: 'B', share: 2.9, pricing: 7, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:2,od:2}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'zymo-cfdna-ext', vendor: 'zymo', name: 'Zymo Quick-cfDNA Serum & Plasma Kit', category: 'Extraction', tier: 'B', share: 2.2, pricing: 9, regulatory: 'RUO', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:4,we:2,hg:1,od:1}, growth: "growing", indications: ["liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'mn-nucleomag-ext', vendor: 'macherey_nagel', name: 'Macherey-Nagel NucleoMag DNA/RNA FFPE', category: 'Extraction', tier: 'B', share: 3.6, pricing: 6, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:9,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"estimated",source:"EU distributor data",date:"2026-Q1"}} },
  { id: 'omega-magbind-ext', vendor: 'omega', name: 'Omega Mag-Bind TotalPure NGS', category: 'Extraction', tier: 'C', share: 2.2, pricing: 2, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:1,hg:4,od:2}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'omega-cfdna-ext', vendor: 'omega', name: 'Omega Mag-Bind cfDNA Kit', category: 'Extraction', tier: 'C', share: 1.4, pricing: 8, regulatory: 'RUO', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:2,we:1,hg:2,od:1}, growth: "growing", indications: ["liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'qiagen-qiasymphony-ext', vendor: 'qiagen', name: 'QIAsymphony DSP DNA/RNA', category: 'Extraction', tier: 'A', share: 8.6, pricing: 10, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:10,we:13,hg:7,od:10}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },
  { id: 'promega-maxwell-ffpe', vendor: 'promega', name: 'Promega Maxwell RSC FFPE DNA/RNA', category: 'Extraction', tier: 'B', share: 4.3, pricing: 8, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:3,od:4}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },
  { id: 'promega-maxwell-blood', vendor: 'promega', name: 'Promega Maxwell RSC Blood DNA', category: 'Extraction', tier: 'B', share: 2.9, pricing: 6, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:4,we:2,hg:2,od:2}, growth: "growing", indications: ["hereditary_cancer","liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },

  // LIBRARY PREP
  { id: 'illumina-dna-prep', vendor: 'illumina', name: 'Illumina DNA Prep', category: 'Library Prep', tier: 'A', share: 4.5, pricing: 50, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:20,we:16,hg:13,od:15}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'illumina-tso500', vendor: 'illumina', name: 'TSO500', category: 'Library Prep', tier: 'A', share: 4.1, pricing: 315, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:18,we:15,hg:9,od:13}, growth: "growing", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {solid_tumor:{global:15,na:16,we:14,hg:7,od:13},liquid_biopsy:{global:7,na:9,we:7,hg:4,od:5}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA 510(k) K201968",date:"2026-Q1"}} },
  { id: 'illumina-tst170', vendor: 'illumina', name: 'TST170', category: 'Library Prep', tier: 'B', share: 2.3, pricing: 200, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:3,od:5}, growth: "declining", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:4,na:4,we:4,hg:3,od:5}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'illumina-hereditary', vendor: 'illumina', name: 'Illumina Hereditary', category: 'Library Prep', tier: 'A', share: 2.7, pricing: 180, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:13,we:7,hg:3,od:7}, growth: "stable", indications: ["hereditary_cancer"], indicationShare: {hereditary_cancer:{global:9,na:13,we:7,hg:3,od:7}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'illumina-rna-prep', vendor: 'illumina', name: 'Illumina RNA Prep', category: 'Library Prep', tier: 'B', share: 2.7, pricing: 55, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["rna"], regionalShare: {na:9,we:7,hg:5,od:6}, growth: "stable", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'agilent-sureselect', vendor: 'agilent', name: 'SureSelect XT', category: 'Library Prep', tier: 'A', share: 2.7, pricing: 150, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:11,we:15,hg:9,od:13}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {solid_tumor:{global:7,na:6,we:9,hg:6,od:8},rare_disease:{global:11,na:9,we:13,hg:9,od:13}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'twist-panels', vendor: 'twist', name: 'Twist Panels', category: 'Library Prep', tier: 'B', share: 1.4, pricing: 90, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'idt-xgen', vendor: 'idt', name: 'IDT xGen', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 85, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:7,we:5,hg:4,od:5}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'kapa-hyperprep', vendor: 'roche', name: 'KAPA HyperPrep', category: 'Library Prep', tier: 'B', share: 2.3, pricing: 40, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:5,we:7,hg:6,od:7}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'neb-ultraii', vendor: 'neb', name: 'NEB Ultra II', category: 'Library Prep', tier: 'B', share: 1.4, pricing: 30, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'oncomine-dx', vendor: 'thermo', name: 'Oncomine DX', category: 'Library Prep', tier: 'A', share: 2.7, pricing: 250, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:13,we:11,hg:25,od:15}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:16,na:13,we:11,hg:25,od:15}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA database",date:"2026-Q1"}} },
  { id: 'ion-ampliseq', vendor: 'thermo', name: 'Ion AmpliSeq', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 35, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:6,hg:15,od:9}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","pharmacogenomics","infectious_disease"], indicationShare: {solid_tumor:{global:5,na:5,we:5,hg:11,od:7},pharmacogenomics:{global:14,na:11,we:9,hg:18,od:16}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'roche-avenio', vendor: 'roche', name: 'Avenio Library Prep', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 220, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:7,we:9,hg:3,od:5}, growth: "stable", indications: ["liquid_biopsy"], indicationShare: {liquid_biopsy:{global:9,na:11,we:9,hg:5,od:7}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'qiaseq-panels', vendor: 'qiagen', name: 'QIAseq Panels', category: 'Library Prep', tier: 'B', share: 1.4, pricing: 95, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'archer-fusionplex', vendor: 'archerdx', name: 'Archer FusionPlex (RNA Fusions/Variants)', category: 'Library Prep', tier: 'B', share: 1.4, pricing: 180, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["rna"], regionalShare: {na:5,we:4,hg:2,od:3}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {solid_tumor:{global:5,na:6,we:5,hg:3,od:5},heme_malig:{global:4,na:5,we:4,hg:2,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'archer-variantplex', vendor: 'archerdx', name: 'Archer VariantPlex (DNA Somatic Variants)', category: 'Library Prep', tier: 'B', share: 0.5, pricing: 160, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna"], regionalShare: {na:4,we:3,hg:1,od:2}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {solid_tumor:{global:4,na:5,we:4,hg:2,od:3},heme_malig:{global:3,na:4,we:3,hg:1,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'archer-liquidplex', vendor: 'archerdx', name: 'Archer LiquidPlex (cfDNA Liquid Biopsy)', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 220, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:3,we:2,hg:1,od:1}, growth: "growing", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:4,na:5,we:4,hg:2,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'cleanplex', vendor: 'paragon', name: 'CleanPlex', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 25, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:1}, growth: "growing", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'pillar-oncoreveal', vendor: 'pillar', name: 'Pillar OncoReveal', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 210, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:1,hg:3,od:1}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {solid_tumor:{global:3,na:3,we:1,hg:5,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA database",date:"2026-Q1"}} },
  { id: 'sophia-panels', vendor: 'sophia', name: 'Sophia Panels', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 160, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:4,hg:1,od:2}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {solid_tumor:{global:4,na:1,we:6,hg:2,od:3},heme_malig:{global:5,na:2,we:7,hg:3,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'nextflex', vendor: 'revvity', name: 'NextFlex', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 35, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'takara-smarter', vendor: 'takara', name: 'Takara Smarter', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 55, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:1,od:1}, growth: "stable", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'swift-accel', vendor: 'idt', name: 'Swift Accel', category: 'Library Prep', tier: 'C', share: 1.4, pricing: 60, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "growing", indications: ["solid_tumor"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'invivoscribe-lympho', vendor: 'invivoscribe', name: 'Invivoscribe Lympho', category: 'Library Prep', tier: 'B', share: 1.4, pricing: 200, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:6,hg:4,od:5}, growth: "stable", indications: ["heme_malig"], indicationShare: {heme_malig:{global:18,na:16,we:23,hg:9,od:20}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },

  // ── ADDITIONAL LIBRARY PREP (EXHAUSTIVE) ──
  { id: 'archer-reveal-ctdna', vendor: 'archerdx', name: 'Archer Reveal ctDNA 28', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 200, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:2,na:3,we:2,hg:1,od:1}}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'archer-fusionplex-ht', vendor: 'archerdx', name: 'Archer FusionPlex-HT (High Throughput)', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 150, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'archer-variantplex-ht', vendor: 'archerdx', name: 'Archer VariantPlex-HT (High Throughput)', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 130, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'illumina-tso500-hrd', vendor: 'illumina', name: 'TruSight Oncology 500 HRD', category: 'Library Prep', tier: 'B', share: 2.3, pricing: 350, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:2}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:4,na:5,we:4,hg:2,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'illumina-tso-comp-eu', vendor: 'illumina', name: 'TruSight Oncology Comprehensive (EU)', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 380, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:3,na:1,we:5,hg:2,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'illumina-ampliseq', vendor: 'illumina', name: 'AmpliSeq for Illumina Panels', category: 'Library Prep', tier: 'B', share: 2.3, pricing: 30, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:2}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","pharmacogenomics","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'thermo-oncomine-precision', vendor: 'thermo', name: 'Oncomine Precision Assay', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 200, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:2}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:4,na:3,we:4,hg:5,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'thermo-ampliseq-hd', vendor: 'thermo', name: 'Ion AmpliSeq HD', category: 'Library Prep', tier: 'B', share: 0.9, pricing: 45, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "stable", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {liquid_biopsy:{global:3,na:3,we:2,hg:4,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'roche-kapa-hypercap', vendor: 'roche', name: 'KAPA HyperCap Workflow', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 120, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'roche-kapa-rna', vendor: 'roche', name: 'KAPA RNA HyperPrep', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 45, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'agilent-sureselect-cre', vendor: 'agilent', name: 'SureSelect Clinical Research Exome V3', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 175, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "stable", indications: ["hereditary_cancer","rare_disease"], indicationShare: {rare_disease:{global:9,na:7,we:11,hg:7,od:11},hereditary_cancer:{global:5,na:5,we:7,hg:5,od:6}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'agilent-sureselect-focused', vendor: 'agilent', name: 'SureSelect Focused Exome', category: 'Library Prep', tier: 'C', share: 1.8, pricing: 130, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'twist-alliance-exome', vendor: 'twist', name: 'Twist Alliance Clinical Research Exome', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 110, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["hereditary_cancer","rare_disease"], indicationShare: {rare_disease:{global:5,na:5,we:5,hg:3,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'twist-cfdna', vendor: 'twist', name: 'Twist cfDNA Pan-Cancer Panel', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 140, regulatory: 'RUO', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["liquid_biopsy"], indicationShare: {liquid_biopsy:{global:2,na:3,we:2,hg:1,od:1}}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'idt-xgen-prism', vendor: 'idt', name: 'xGen Prism DNA Library Prep', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 35, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'idt-xgen-cfdna', vendor: 'idt', name: 'xGen cfDNA & FFPE DNA Library Prep', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 55, regulatory: 'RUO', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:2,na:3,we:2,hg:1,od:1}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'qiaseq-methyl', vendor: 'qiagen', name: 'QIAseq Targeted Methyl Panels', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 110, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'sophia-solid-tumor', vendor: 'sophia', name: 'SOPHiA Solid Tumor Solution', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 180, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:1,hg:4,od:1}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:3,na:1,we:5,hg:2,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'sophia-myeloid', vendor: 'sophia', name: 'SOPHiA Myeloid Solution', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 170, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:0,hg:2,od:0}, growth: "emerging", indications: ["heme_malig"], indicationShare: {heme_malig:{global:3,na:1,we:5,hg:2,od:2}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'sophia-hereditary', vendor: 'sophia', name: 'SOPHiA Hereditary Cancer Solution', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 155, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:0,hg:2,od:0}, growth: "emerging", indications: ["hereditary_cancer"], indicationShare: {hereditary_cancer:{global:2,na:1,we:4,hg:1,od:1}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'watchmaker-dna', vendor: 'watchmaker', name: 'Watchmaker DNA Library Prep Kit', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 25, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'watchmaker-rna-polaris', vendor: 'watchmaker', name: 'Watchmaker RNA Prep + Polaris Depletion', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 40, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'neb-nebnext-direct', vendor: 'neb', name: 'NEBNext Direct Targeted Panels', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 75, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'biorad-ddseq', vendor: 'biorad', name: 'Bio-Rad ddSEQ Library Prep', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 65, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'seqonce-rapidseq', vendor: 'seqonce', name: 'SeqOnce RapidSeq Library Prep', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 18, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'guardant360-cdx', vendor: 'guardant', name: 'Guardant360 CDx (Service/Panel)', category: 'Library Prep', tier: 'A', share: 3.2, pricing: 5000, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:6,hg:4,od:5}, growth: "stable", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:20,na:25,we:14,hg:7,od:11}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA PMA P200010",date:"2026-Q1"}} },
  { id: 'foundation-one-cdx', vendor: 'foundation', name: 'FoundationOne CDx (Service/Panel)', category: 'Library Prep', tier: 'A', share: 3.6, pricing: 3500, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:11,we:8,hg:5,od:7}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:18,na:23,we:13,hg:9,od:14}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA PMA P170019",date:"2026-Q1"}} },
  { id: 'foundation-liquid-cdx', vendor: 'foundation', name: 'FoundationOne Liquid CDx (Service/Panel)', category: 'Library Prep', tier: 'B', share: 2.7, pricing: 3500, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:4,hg:2,od:4}, growth: "growing", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:13,na:16,we:9,hg:5,od:7}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA PMA P200016",date:"2026-Q1"}} },
  { id: 'tempus-xt', vendor: 'tempus', name: 'Tempus xT 595-Gene Panel (Service)', category: 'Library Prep', tier: 'B', share: 2.7, pricing: 3200, regulatory: 'CLIA/CAP', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:4,hg:2,od:4}, growth: "growing", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:7,na:11,we:3,hg:2,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'caris-mi-profile', vendor: 'caris', name: 'Caris MI Profile WES/WTS (Service)', category: 'Library Prep', tier: 'B', share: 2.3, pricing: 4500, regulatory: 'CLIA/CAP', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "growing", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:5,na:9,we:2,hg:1,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'mgi-cools-panels', vendor: 'mgi', name: 'MGI CoolMPS Library Prep Panels', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 30, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:1,hg:4,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","infectious_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'pillar-oncoreveal-lung', vendor: 'pillar', name: 'oncoReveal Dx Lung & Colon Cancer Assay', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 190, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:2,na:2,we:1,hg:3,od:1}}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA database",date:"2026-Q1"}} },
  { id: 'illumina-tso500-ctdna', vendor: 'illumina', name: 'TruSight Oncology 500 ctDNA', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 380, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:1,od:2}, growth: "growing", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:7,na:9,we:7,hg:3,od:5}}, confidence: {share:{level:"estimated",source:"DeciBio + channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },
  { id: 'myriad-mychoice-cdx', vendor: 'myriad', name: 'Myriad myChoice CDx (HRD)', category: 'Library Prep', tier: 'A', share: 2.7, pricing: 4200, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna"], regionalShare: {na:7,we:4,hg:2,od:3}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:7,na:11,we:5,hg:3,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio + public filings",date:"2026-Q1"},pricing:{level:"verified",source:"Service model pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA PMA P190014",date:"2026-Q1"}} },
  { id: '10x-chromium-sc', vendor: '10x', name: '10x Chromium Single Cell Gene Expression', category: 'Library Prep', tier: 'A', share: 2.3, pricing: 500, regulatory: 'RUO', region: 'global', sampleTypes: ["blood","tissue"], nucleicAcids: ["rna"], regionalShare: {na:5,we:5,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"10x public filings + DeciBio",date:"2026-Q1"},pricing:{level:"estimated",source:"Public pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'natera-signatera', vendor: 'natera', name: 'Natera Signatera MRD (Service)', category: 'Library Prep', tier: 'A', share: 2.3, pricing: 3500, regulatory: 'CLIA/CAP', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:6,we:2,hg:1,od:1}, growth: "growing", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {liquid_biopsy:{global:5,na:9,we:3,hg:1,od:2},solid_tumor:{global:3,na:5,we:2,hg:1,od:1}}, confidence: {share:{level:"estimated",source:"Natera public filings + DeciBio",date:"2026-Q1"},pricing:{level:"verified",source:"Service model pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"CLIA/CAP certified",date:"2026-Q1"}} },

  // AUTOMATION — Tier A (High-Throughput Production)
  { id: 'Hamilton-ngs', vendor: 'hamilton', name: 'Hamilton Microlab STAR', category: 'Automation', tier: 'A', share: 17, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:19,we:18,hg:12,od:16}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'hamilton-vantage', vendor: 'hamilton', name: 'Hamilton Microlab VANTAGE', category: 'Automation', tier: 'A', share: 8, pricing: 6, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:8,hg:5,od:7}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'tecan-fluent', vendor: 'tecan', name: 'Tecan Fluent', category: 'Automation', tier: 'A', share: 13, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:15,we:14,hg:9,od:12}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'beckman-biomek-i7', vendor: 'beckman', name: 'Beckman Biomek i7', category: 'Automation', tier: 'A', share: 10, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:11,we:10,hg:7,od:9}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  // AUTOMATION — Tier B (Mid-Throughput / Focused NGS)
  { id: 'beckman-biomek-i5', vendor: 'beckman', name: 'Beckman Biomek i5', category: 'Automation', tier: 'B', share: 7, pricing: 4, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'beckman-ngenius', vendor: 'beckman', name: 'Biomek NGeniuS (NGS-Specific)', category: 'Automation', tier: 'B', share: 3, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'agilent-bravo', vendor: 'agilent', name: 'Agilent Bravo NGS', category: 'Automation', tier: 'B', share: 7, pricing: 4, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'revvity-sciclone', vendor: 'revvity', name: 'Revvity Sciclone NGSx iQ', category: 'Automation', tier: 'B', share: 4, pricing: 5, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'revvity-janus', vendor: 'revvity', name: 'Revvity Janus G3', category: 'Automation', tier: 'B', share: 3, pricing: 4, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'eppendorf-epmotion', vendor: 'eppendorf', name: 'Eppendorf epMotion 5075', category: 'Automation', tier: 'B', share: 5, pricing: 4, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'thermo-kingfisher', vendor: 'thermo', name: 'Thermo KingFisher Flex', category: 'Automation', tier: 'B', share: 6, pricing: 3, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'opentrons-flex', vendor: 'opentrons', name: 'Opentrons Flex', category: 'Automation', tier: 'B', share: 3, pricing: 2, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  // AUTOMATION — Tier C (Emerging / Specialty)
  { id: 'beckman-biomek-i3', vendor: 'beckman', name: 'Beckman Biomek i3 (Benchtop)', category: 'Automation', tier: 'C', share: 1, pricing: 3, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'spt-firefly', vendor: 'spt_labtech', name: 'SPT Labtech firefly', category: 'Automation', tier: 'C', share: 1.5, pricing: 3, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'spt-mosquito', vendor: 'spt_labtech', name: 'SPT Labtech mosquito HV Genomics', category: 'Automation', tier: 'C', share: 1, pricing: 2, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'opentrons-ot2', vendor: 'opentrons', name: 'Opentrons OT-2', category: 'Automation', tier: 'C', share: 1, pricing: 1, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'clearlabs-dx', vendor: 'clearlabs', name: 'Clear Labs DX', category: 'Automation', tier: 'C', share: 1.0, pricing: 8, regulatory: 'FDA EUA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA EUA database",date:"2026-Q1"}} },
  { id: 'integra-miro-canvas', vendor: 'integra', name: 'INTEGRA MIRO CANVAS', category: 'Automation', tier: 'C', share: 1.5, pricing: 3, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:3,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'roche-magna-automation', vendor: 'roche', name: 'Roche MagNA Pure 96', category: 'Automation', tier: 'B', share: 4, pricing: 5, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'qiagen-qiacube', vendor: 'qiagen', name: 'QIAcube Connect', category: 'Automation', tier: 'B', share: 5, pricing: 4, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },

  // SEQUENCING — Illumina Short-Read
  { id: 'miseq', vendor: 'illumina', name: 'MiSeq', category: 'Sequencing', tier: 'B', share: 6, pricing: 70, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:9,we:7,hg:4,od:6}, growth: "declining", indications: ["solid_tumor","hereditary_cancer","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'miseqdx', vendor: 'illumina', name: 'MiSeqDx', category: 'Sequencing', tier: 'A', share: 10, pricing: 80, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:14,we:10,hg:6,od:9}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA database",date:"2026-Q1"}} },
  { id: 'miseq-i100', vendor: 'illumina', name: 'MiSeq i100 Series', category: 'Sequencing', tier: 'B', share: 2, pricing: 60, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'nextseq-1000', vendor: 'illumina', name: 'NextSeq 1000', category: 'Sequencing', tier: 'B', share: 5, pricing: 100, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'nextseq', vendor: 'illumina', name: 'NextSeq 2000', category: 'Sequencing', tier: 'A', share: 12, pricing: 120, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:16,we:12,hg:7,od:11}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'nextseq-dx', vendor: 'illumina', name: 'NextSeq 550Dx', category: 'Sequencing', tier: 'A', share: 9, pricing: 130, regulatory: 'FDA 510(k)', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:12,we:9,hg:5,od:8}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA database",date:"2026-Q1"}} },
  { id: 'novaseq-x', vendor: 'illumina', name: 'NovaSeq X (Single Flow Cell)', category: 'Sequencing', tier: 'A', share: 6, pricing: 400, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:9,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics"], indicationShare: {solid_tumor:{global:8,na:10,we:8,hg:4,od:6}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'novaseq-x-plus', vendor: 'illumina', name: 'NovaSeq X Plus (Dual Flow Cell)', category: 'Sequencing', tier: 'A', share: 8, pricing: 600, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:12,we:9,hg:5,od:8}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics"], indicationShare: {solid_tumor:{global:10,na:14,we:10,hg:5,od:8}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'novaseq-6000', vendor: 'illumina', name: 'NovaSeq 6000', category: 'Sequencing', tier: 'B', share: 8, pricing: 500, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — Thermo Fisher Semiconductor
  { id: 'genexus-system', vendor: 'genexus', name: 'Genexus Integrated Sequencer', category: 'Sequencing', tier: 'B', share: 3, pricing: 120, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {solid_tumor:{global:5,na:4,we:4,hg:8,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'ion-torrent', vendor: 'thermo', name: 'Ion GeneStudio S5', category: 'Sequencing', tier: 'B', share: 5, pricing: 65, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:6,hg:3,od:5}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'ion-s5', vendor: 'thermo', name: 'Ion S5 XL', category: 'Sequencing', tier: 'B', share: 4, pricing: 55, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:2,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'proton', vendor: 'thermo', name: 'Ion Proton (Legacy)', category: 'Sequencing', tier: 'C', share: 1, pricing: 90, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "declining", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — MGI / Complete Genomics (BGI Group)
  { id: 'mgi-seq', vendor: 'mgi', name: 'DNBSEQ-G400 / G99', category: 'Sequencing', tier: 'B', share: 5, pricing: 50, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:3,hg:12,od:3}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'mgi-t7', vendor: 'mgi', name: 'DNBSEQ-T7', category: 'Sequencing', tier: 'B', share: 3, pricing: 200, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:6,od:1}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'cg-t1plus', vendor: 'complete_genomics', name: 'DNBSEQ-T1+RS', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 80, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:0,hg:2,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'cg-e25', vendor: 'complete_genomics', name: 'E25 Flash Portable Sequencer', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 40, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:0,hg:2,od:0}, growth: "emerging", indications: ["infectious_disease","pharmacogenomics"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — Roche (New Entrant)
  { id: 'roche-axelios', vendor: 'roche', name: 'Roche Axelios 1 (SBX)', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 150, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing - $150 genome",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — Element Biosciences
  { id: 'element-aviti', vendor: 'element', name: 'AVITI', category: 'Sequencing', tier: 'C', share: 2, pricing: 100, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'element-aviti24', vendor: 'element', name: 'AVITI24 5D Multiomic', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 150, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — Ultima Genomics
  { id: 'ultima-ug100', vendor: 'ultima', name: 'Ultima UG 100', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 100, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"$80/genome bulk pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'ultima-ug200', vendor: 'ultima', name: 'Ultima UG 200', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 80, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — Long-Read Platforms
  { id: 'pacbio-revio', vendor: 'pacbio', name: 'PacBio Revio', category: 'Sequencing', tier: 'C', share: 2, pricing: 500, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'pacbio-vega', vendor: 'pacbio', name: 'PacBio Vega (Benchtop)', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 250, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","pharmacogenomics","hla_typing"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'oxford-minion', vendor: 'oxford', name: 'Oxford Nanopore MinION', category: 'Sequencing', tier: 'C', share: 1, pricing: 500, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'oxford-promethion', vendor: 'oxford', name: 'Oxford Nanopore PromethION', category: 'Sequencing', tier: 'C', share: 1, pricing: 200, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'oxford-promethion-plus', vendor: 'oxford', name: 'PromethION Plus', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 180, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'oxford-gridion', vendor: 'oxford', name: 'Oxford Nanopore GridION', category: 'Sequencing', tier: 'C', share: 1.5, pricing: 150, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio + channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'oxford-p2i', vendor: 'oxford', name: 'Oxford Nanopore PromethION 2 Integrated', category: 'Sequencing', tier: 'C', share: 0.5, pricing: 170, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Early access pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'pacbio-onso', vendor: 'pacbio', name: 'PacBio Onso', category: 'Sequencing', tier: 'C', share: 0.5, pricing: 80, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing estimates",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },

  // SEQUENCING — Singular Genomics
  { id: 'singular-g4x', vendor: 'singular', name: 'Singular G4X Spatial Sequencer', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 300, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Early adopter pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // ANALYSIS
  { id: 'illumina-basespace', vendor: 'illumina', name: 'Illumina BaseSpace', category: 'Analysis', tier: 'A', share: 20, pricing: 0, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:13,we:9,hg:5,od:8}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'sophia-ddm', vendor: 'sophia', name: 'Sophia DDM', category: 'Analysis', tier: 'B', share: 10, pricing: 45, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:3,hg:11,od:3}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {solid_tumor:{global:8,na:5,we:12,hg:7,od:7},hereditary_cancer:{global:5,na:3,we:9,hg:4,od:4},heme_malig:{global:7,na:4,we:11,hg:5,od:5}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'roche-seqexplorer', vendor: 'roche', name: 'Roche SeqExplorer', category: 'Analysis', tier: 'B', share: 8.7, pricing: 25, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'dragen', vendor: 'illumina', name: 'DRAGEN', category: 'Analysis', tier: 'A', share: 14.7, pricing: 8, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:9,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA database",date:"2026-Q1"}} },
  { id: 'thermo-torrent-suite', vendor: 'thermo', name: 'Torrent Suite', category: 'Analysis', tier: 'B', share: 6, pricing: 0, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:1,od:3}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'agilent-genomics-workbench', vendor: 'agilent', name: 'Genomics Workbench', category: 'Analysis', tier: 'B', share: 4.7, pricing: 15, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:1,od:2}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'strand-ngs', vendor: 'qiagen', name: 'Strand NGS', category: 'Analysis', tier: 'C', share: 2.7, pricing: 10, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'nvidia-parabricks', vendor: 'nvidia', name: 'NVIDIA Parabricks', category: 'Analysis', tier: 'B', share: 3.3, pricing: 3, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:1,od:2}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"NVIDIA licensing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'broad-gatk', vendor: 'broad', name: 'GATK (Genome Analysis Toolkit)', category: 'Analysis', tier: 'A', share: 16.7, pricing: 0, regulatory: 'Open Source', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:11,we:9,hg:7,od:8}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"Academic surveys + DeciBio",date:"2026-Q1"},pricing:{level:"verified",source:"Open source",date:"2026-Q1"},regulatory:{level:"verified",source:"Broad Institute",date:"2026-Q1"}} },
  { id: 'sentieon-dnascope', vendor: 'sentieon', name: 'Sentieon DNAscope/TNscope', category: 'Analysis', tier: 'B', share: 2.7, pricing: 5, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:1,od:2}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Commercial licensing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'qiagen-clc', vendor: 'qiagen', name: 'QIAGEN CLC Genomics Workbench', category: 'Analysis', tier: 'B', share: 5.3, pricing: 20, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:4,hg:3,od:3}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },
  { id: 'pacbio-smrt-link', vendor: 'pacbio', name: 'PacBio SMRT Link', category: 'Analysis', tier: 'C', share: 1.3, pricing: 0, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "growing", indications: ["rare_disease","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"verified",source:"Bundled with instrument",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'oxford-epi2me', vendor: 'oxford', name: 'Oxford Nanopore EPI2ME', category: 'Analysis', tier: 'C', share: 1.3, pricing: 0, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:1,od:1}, growth: "growing", indications: ["rare_disease","infectious_disease","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"verified",source:"Bundled with platform",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'dnaxnexus-platform', vendor: 'dnaxnexus', name: 'DNAnexus Apollo Platform', category: 'Analysis', tier: 'B', share: 2.7, pricing: 15, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:1}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease","pharmacogenomics"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Enterprise licensing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },

  // REPORTING
  { id: 'qci-interpret', vendor: 'qiagen', name: 'QCI-Interpret', category: 'Reporting', tier: 'A', share: 27.8, pricing: 50, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:14,we:13,hg:8,od:11}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {solid_tumor:{global:22,na:26,we:20,hg:13,od:17},hereditary_cancer:{global:17,na:19,we:17,hg:9,od:14}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'ici', vendor: 'illumina', name: 'ICI', category: 'Reporting', tier: 'A', share: 19.4, pricing: 35, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:11,we:8,hg:5,od:7}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {rare_disease:{global:14,na:17,we:13,hg:7,od:11}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'varsome', vendor: 'saphetor', name: 'VarSome', category: 'Reporting', tier: 'B', share: 17.6, pricing: 30, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:8,hg:6,od:7}, growth: "stable", indications: ["hereditary_cancer","rare_disease"], indicationShare: {hereditary_cancer:{global:17,na:11,we:20,hg:15,od:13},rare_disease:{global:19,na:15,we:22,hg:17,od:15}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'velsera-cg', vendor: 'velsera', name: 'Velsera CG', category: 'Reporting', tier: 'B', share: 13.9, pricing: 40, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:6,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'fabric-gem', vendor: 'fabric', name: 'Fabric Genome', category: 'Reporting', tier: 'C', share: 5.6, pricing: 25, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:2,od:2}, growth: "emerging", indications: ["hereditary_cancer","rare_disease"], indicationShare: {hereditary_cancer:{global:9,na:13,we:6,hg:4,od:6}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'intellispace', vendor: 'philips', name: 'Intellispace Genomics', category: 'Reporting', tier: 'C', share: 4.6, pricing: 55, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'qiagen-curation', vendor: 'qiagen', name: 'Qiagen Curation Services', category: 'Reporting', tier: 'C', share: 3.7, pricing: 20, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'emedgene-interpret', vendor: 'emedgene', name: 'Emedgene (Illumina) AI Interpretation', category: 'Reporting', tier: 'B', share: 7.4, pricing: 40, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:4,hg:2,od:3}, growth: "growing", indications: ["rare_disease","hereditary_cancer"], indicationShare: {rare_disease:{global:11,na:13,we:9,hg:6,od:7},hereditary_cancer:{global:6,na:7,we:5,hg:3,od:4}}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Enterprise licensing",date:"2026-Q1"},regulatory:{level:"estimated",source:"EU regulatory tracking",date:"2026-Q1"}} },
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
  { year: 2025, event: 'Oxford Nanopore PromethION 2 Integrated (P2i) early access', vendor: 'oxford', impact: 'Medium' },
  { year: 2025, event: 'PacBio Onso short-read sequencer launch', vendor: 'pacbio', impact: 'Medium' },
  { year: 2025, event: 'Myriad myChoice CDx expanded tumor types', vendor: 'myriad', impact: 'Medium' },
  { year: 2025, event: 'Natera Signatera Medicare MRD coverage', vendor: 'natera', impact: 'High' },
  { year: 2025, event: 'DNAnexus Apollo Informatics platform launch', vendor: 'dnaxnexus', impact: 'Medium' },
  { year: 2025, event: 'Sentieon cloud deployment expansion', vendor: 'sentieon', impact: 'Medium' },
  { year: 2026, event: 'Illumina TruSight Oncology 500 ctDNA expanded', vendor: 'illumina', impact: 'Medium' },
  { year: 2026, event: 'INTEGRA MIRO CANVAS NGS workflow library', vendor: 'integra', impact: 'Medium' },
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

  // ── NEW EXTRACTION → LIBRARY PREP COMPATIBILITY ──
  // Zymo FFPE extraction
  { source: 'zymo-ffpe-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Zymo FFPE output compatible with Illumina DNA Prep' },
  { source: 'zymo-ffpe-ext', target: 'illumina-tso500', layer: 'ext_to_libprep', level: 'compatible', notes: 'Zymo FFPE DNA for TSO500 workflow' },
  { source: 'zymo-ffpe-ext', target: 'kapa-hyperprep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Standard FFPE DNA input' },
  { source: 'zymo-ffpe-ext', target: 'agilent-sureselect', layer: 'ext_to_libprep', level: 'compatible', notes: 'Zymo FFPE + SureSelect community validated' },
  { source: 'zymo-ffpe-ext', target: 'twist-panels', layer: 'ext_to_libprep', level: 'compatible', notes: 'Community validated' },
  { source: 'zymo-ffpe-ext', target: 'neb-ultraii', layer: 'ext_to_libprep', level: 'compatible', notes: 'Standard DNA input' },
  // Zymo cfDNA extraction
  { source: 'zymo-cfdna-ext', target: 'roche-avenio', layer: 'ext_to_libprep', level: 'compatible', notes: 'cfDNA extraction for liquid biopsy panels' },
  { source: 'zymo-cfdna-ext', target: 'illumina-tso500-ctdna', layer: 'ext_to_libprep', level: 'compatible', notes: 'cfDNA for TSO500 ctDNA workflow' },
  { source: 'zymo-cfdna-ext', target: 'archer-liquidplex', layer: 'ext_to_libprep', level: 'compatible', notes: 'cfDNA for Archer liquid biopsy' },
  { source: 'zymo-cfdna-ext', target: 'twist-cfdna', layer: 'ext_to_libprep', level: 'compatible', notes: 'cfDNA for Twist Pan-Cancer' },
  // Macherey-Nagel NucleoMag extraction
  { source: 'mn-nucleomag-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'compatible', notes: 'NucleoMag bead output for Illumina workflows' },
  { source: 'mn-nucleomag-ext', target: 'illumina-tso500', layer: 'ext_to_libprep', level: 'compatible', notes: 'NucleoMag FFPE DNA for TSO500' },
  { source: 'mn-nucleomag-ext', target: 'kapa-hyperprep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Standard bead-based extraction output' },
  { source: 'mn-nucleomag-ext', target: 'agilent-sureselect', layer: 'ext_to_libprep', level: 'compatible', notes: 'NucleoMag + SureSelect EU lab standard' },
  { source: 'mn-nucleomag-ext', target: 'sophia-panels', layer: 'ext_to_libprep', level: 'validated', notes: 'SOPHiA recommended extraction', protocol: 'SOPHiA Protocol' },
  // Omega Bio-tek extraction
  { source: 'omega-magbind-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Mag-Bind cleanup for Illumina workflows' },
  { source: 'omega-magbind-ext', target: 'kapa-hyperprep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Budget extraction + KAPA workflow' },
  { source: 'omega-magbind-ext', target: 'neb-ultraii', layer: 'ext_to_libprep', level: 'compatible', notes: 'Standard DNA input' },
  { source: 'omega-cfdna-ext', target: 'roche-avenio', layer: 'ext_to_libprep', level: 'compatible', notes: 'cfDNA extraction for liquid biopsy' },
  { source: 'omega-cfdna-ext', target: 'illumina-tso500-ctdna', layer: 'ext_to_libprep', level: 'compatible', notes: 'cfDNA for TSO500 ctDNA' },
  // QIAsymphony automated extraction
  { source: 'qiagen-qiasymphony-ext', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'validated', notes: 'QIAsymphony → Illumina DNA Prep validated', protocol: 'Qiagen AN' },
  { source: 'qiagen-qiasymphony-ext', target: 'illumina-tso500', layer: 'ext_to_libprep', level: 'validated', notes: 'QIAsymphony standard for TSO500 workflow', protocol: 'Illumina/Qiagen Protocol' },
  { source: 'qiagen-qiasymphony-ext', target: 'qiaseq-panels', layer: 'ext_to_libprep', level: 'validated', notes: 'Qiagen integrated workflow', protocol: 'Qiagen Protocol' },
  { source: 'qiagen-qiasymphony-ext', target: 'kapa-hyperprep', layer: 'ext_to_libprep', level: 'validated', notes: 'High-throughput extraction to KAPA', protocol: 'Roche AN' },
  { source: 'qiagen-qiasymphony-ext', target: 'agilent-sureselect', layer: 'ext_to_libprep', level: 'validated', notes: 'QIAsymphony + SureSelect validated', protocol: 'Agilent AN' },
  { source: 'qiagen-qiasymphony-ext', target: 'sophia-panels', layer: 'ext_to_libprep', level: 'validated', notes: 'SOPHiA recommended extraction', protocol: 'SOPHiA Protocol' },
  // Promega Maxwell RSC extraction
  { source: 'promega-maxwell-ffpe', target: 'illumina-dna-prep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Maxwell RSC FFPE DNA for Illumina workflows' },
  { source: 'promega-maxwell-ffpe', target: 'illumina-tso500', layer: 'ext_to_libprep', level: 'compatible', notes: 'Maxwell RSC FFPE for TSO500' },
  { source: 'promega-maxwell-ffpe', target: 'oncomine-dx', layer: 'ext_to_libprep', level: 'compatible', notes: 'Alternative FFPE extraction path' },
  { source: 'promega-maxwell-ffpe', target: 'kapa-hyperprep', layer: 'ext_to_libprep', level: 'compatible', notes: 'Standard DNA input' },
  { source: 'promega-maxwell-blood', target: 'illumina-hereditary', layer: 'ext_to_libprep', level: 'compatible', notes: 'Blood extraction for germline panels' },
  { source: 'promega-maxwell-blood', target: 'roche-avenio', layer: 'ext_to_libprep', level: 'compatible', notes: 'Blood DNA for liquid biopsy workflow' },

  // ── NEW LIBRARY PREP → AUTOMATION COMPATIBILITY ──
  { source: 'illumina-tso500-ctdna', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 ctDNA Hamilton automation', protocol: 'Illumina Protocol' },
  { source: 'illumina-tso500-ctdna', target: 'tecan-fluent', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 ctDNA Tecan protocol', protocol: 'Tecan AN' },
  { source: 'illumina-tso500-ctdna', target: 'hamilton-vantage', layer: 'libprep_to_auto', level: 'validated', notes: 'TSO500 ctDNA VANTAGE method', protocol: 'Hamilton Protocol' },
  { source: '10x-chromium-sc', target: 'Hamilton-ngs', layer: 'libprep_to_auto', level: 'compatible', notes: '10x post-GEM library prep automation' },
  // INTEGRA MIRO CANVAS automation
  { source: 'illumina-dna-prep', target: 'integra-miro-canvas', layer: 'libprep_to_auto', level: 'compatible', notes: 'MIRO CANVAS low-throughput DNA Prep' },
  { source: 'kapa-hyperprep', target: 'integra-miro-canvas', layer: 'libprep_to_auto', level: 'compatible', notes: 'KAPA on MIRO CANVAS' },
  { source: 'neb-ultraii', target: 'integra-miro-canvas', layer: 'libprep_to_auto', level: 'compatible', notes: 'NEBNext on MIRO CANVAS' },

  // ── NEW LIBRARY PREP → SEQUENCING COMPATIBILITY ──
  { source: 'illumina-tso500-ctdna', target: 'nextseq', layer: 'libprep_to_seq', level: 'validated', notes: 'TSO500 ctDNA on NextSeq 2000', protocol: 'Illumina Protocol' },
  { source: 'illumina-tso500-ctdna', target: 'nextseq-dx', layer: 'libprep_to_seq', level: 'validated', notes: 'TSO500 ctDNA IVD path', protocol: 'Illumina IVD Protocol' },
  { source: 'illumina-tso500-ctdna', target: 'novaseq-x', layer: 'libprep_to_seq', level: 'validated', notes: 'High-throughput ctDNA', protocol: 'Illumina Protocol' },

  // ── NEW SEQUENCING → ANALYSIS COMPATIBILITY ──
  // GridION
  { source: 'oxford-gridion', target: 'oxford-epi2me', layer: 'seq_to_analysis', level: 'validated', notes: 'ONT native analysis pipeline', protocol: 'ONT Protocol' },
  { source: 'oxford-gridion', target: 'broad-gatk', layer: 'seq_to_analysis', level: 'compatible', notes: 'GATK long-read mode support' },
  { source: 'oxford-gridion', target: 'dragen', layer: 'seq_to_analysis', level: 'theoretical', notes: 'Long-read DRAGEN support emerging' },
  // P2i
  { source: 'oxford-p2i', target: 'oxford-epi2me', layer: 'seq_to_analysis', level: 'validated', notes: 'Integrated on-device analysis', protocol: 'ONT Protocol' },
  { source: 'oxford-p2i', target: 'broad-gatk', layer: 'seq_to_analysis', level: 'compatible', notes: 'GATK long-read support' },
  // PacBio Onso
  { source: 'pacbio-onso', target: 'pacbio-smrt-link', layer: 'seq_to_analysis', level: 'validated', notes: 'PacBio native short-read analysis', protocol: 'PacBio Protocol' },
  { source: 'pacbio-onso', target: 'broad-gatk', layer: 'seq_to_analysis', level: 'compatible', notes: 'Standard short-read GATK pipeline' },
  { source: 'pacbio-onso', target: 'dragen', layer: 'seq_to_analysis', level: 'compatible', notes: 'FASTQ input supported' },
  // PacBio Revio → SMRT Link (was missing)
  { source: 'pacbio-revio', target: 'pacbio-smrt-link', layer: 'seq_to_analysis', level: 'validated', notes: 'PacBio native HiFi analysis', protocol: 'PacBio Protocol' },
  { source: 'pacbio-revio', target: 'broad-gatk', layer: 'seq_to_analysis', level: 'validated', notes: 'GATK HiFi variant calling' },
  // Existing sequencers → new analysis tools
  { source: 'miseq', target: 'broad-gatk', layer: 'seq_to_analysis', level: 'validated', notes: 'GATK standard Illumina pipeline' },
  { source: 'nextseq', target: 'broad-gatk', layer: 'seq_to_analysis', level: 'validated', notes: 'GATK standard Illumina pipeline' },
  { source: 'novaseq-x', target: 'broad-gatk', layer: 'seq_to_analysis', level: 'validated', notes: 'GATK standard Illumina pipeline' },
  { source: 'miseq', target: 'nvidia-parabricks', layer: 'seq_to_analysis', level: 'validated', notes: 'GPU-accelerated Illumina analysis' },
  { source: 'nextseq', target: 'nvidia-parabricks', layer: 'seq_to_analysis', level: 'validated', notes: 'GPU-accelerated Illumina analysis' },
  { source: 'novaseq-x', target: 'nvidia-parabricks', layer: 'seq_to_analysis', level: 'validated', notes: 'GPU-accelerated WGS analysis' },
  { source: 'miseq', target: 'sentieon-dnascope', layer: 'seq_to_analysis', level: 'validated', notes: 'Sentieon GATK-compatible pipeline' },
  { source: 'nextseq', target: 'sentieon-dnascope', layer: 'seq_to_analysis', level: 'validated', notes: 'Sentieon GATK-compatible pipeline' },
  { source: 'novaseq-x', target: 'sentieon-dnascope', layer: 'seq_to_analysis', level: 'validated', notes: 'Sentieon accelerated WGS' },
  { source: 'miseq', target: 'qiagen-clc', layer: 'seq_to_analysis', level: 'validated', notes: 'CLC Illumina import' },
  { source: 'nextseq', target: 'qiagen-clc', layer: 'seq_to_analysis', level: 'validated', notes: 'CLC Illumina import' },
  { source: 'ion-torrent', target: 'qiagen-clc', layer: 'seq_to_analysis', level: 'validated', notes: 'CLC Ion Torrent import' },
  { source: 'miseq', target: 'dnaxnexus-platform', layer: 'seq_to_analysis', level: 'validated', notes: 'DNAnexus Illumina pipeline support' },
  { source: 'nextseq', target: 'dnaxnexus-platform', layer: 'seq_to_analysis', level: 'validated', notes: 'DNAnexus Illumina pipeline support' },
  { source: 'novaseq-x', target: 'dnaxnexus-platform', layer: 'seq_to_analysis', level: 'validated', notes: 'DNAnexus production WGS pipelines' },
  // Oxford Nanopore existing sequencers → EPI2ME
  { source: 'oxford-minion', target: 'oxford-epi2me', layer: 'seq_to_analysis', level: 'validated', notes: 'ONT native pipeline', protocol: 'ONT Protocol' },
  { source: 'oxford-promethion', target: 'oxford-epi2me', layer: 'seq_to_analysis', level: 'validated', notes: 'ONT native pipeline', protocol: 'ONT Protocol' },
  { source: 'oxford-promethion-plus', target: 'oxford-epi2me', layer: 'seq_to_analysis', level: 'validated', notes: 'ONT native pipeline', protocol: 'ONT Protocol' },

  // ── NEW ANALYSIS → REPORTING COMPATIBILITY ──
  { source: 'broad-gatk', target: 'qci-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'GATK VCF to QCI interpretation' },
  { source: 'broad-gatk', target: 'varsome', layer: 'analysis_to_report', level: 'validated', notes: 'GATK VCF to VarSome annotation' },
  { source: 'broad-gatk', target: 'emedgene-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'GATK VCF to Emedgene AI' },
  { source: 'broad-gatk', target: 'fabric-gem', layer: 'analysis_to_report', level: 'validated', notes: 'GATK VCF to Fabric GEM scoring' },
  { source: 'nvidia-parabricks', target: 'qci-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'Parabricks VCF to QCI' },
  { source: 'nvidia-parabricks', target: 'varsome', layer: 'analysis_to_report', level: 'validated', notes: 'Parabricks VCF to VarSome' },
  { source: 'sentieon-dnascope', target: 'qci-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'Sentieon VCF to QCI' },
  { source: 'sentieon-dnascope', target: 'varsome', layer: 'analysis_to_report', level: 'validated', notes: 'Sentieon VCF to VarSome' },
  { source: 'sentieon-dnascope', target: 'emedgene-interpret', layer: 'analysis_to_report', level: 'compatible', notes: 'Sentieon VCF compatible with Emedgene' },
  { source: 'qiagen-clc', target: 'qci-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'Qiagen integrated pipeline', protocol: 'Qiagen Protocol' },
  { source: 'pacbio-smrt-link', target: 'varsome', layer: 'analysis_to_report', level: 'compatible', notes: 'SMRT Link VCF to VarSome' },
  { source: 'oxford-epi2me', target: 'varsome', layer: 'analysis_to_report', level: 'compatible', notes: 'EPI2ME VCF to VarSome' },
  { source: 'dnaxnexus-platform', target: 'qci-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'DNAnexus VCF export to QCI' },
  { source: 'dnaxnexus-platform', target: 'emedgene-interpret', layer: 'analysis_to_report', level: 'compatible', notes: 'DNAnexus output to Emedgene' },
  { source: 'dragen', target: 'emedgene-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'Illumina DRAGEN → Emedgene AI', protocol: 'Illumina Protocol' },
  { source: 'illumina-basespace', target: 'emedgene-interpret', layer: 'analysis_to_report', level: 'validated', notes: 'BaseSpace → Emedgene integration', protocol: 'Illumina Protocol' },
];

// ============================================
// HISTORICAL DATA & MARKET SIZING
// ============================================

const HISTORICAL_SNAPSHOTS = [
  { quarter: '2024-Q4', data: { 'qiagen-ffpe-ext': { share: 14.8, pricing: 8 }, 'qiagen-blood-ext': { share: 12.0, pricing: 5 }, 'roche-magna-ext': { share: 13.2, pricing: 7 }, 'thermo-magmax-ext': { share: 12.5, pricing: 6 }, 'illumina-dna-prep': { share: 18.3, pricing: 42 }, 'illumina-tso500': { share: 8.5, pricing: 78 }, 'agilent-sureselect': { share: 14.2, pricing: 65 }, 'twist-panels': { share: 5.8, pricing: 75 }, 'kapa-hyperprep': { share: 11.2, pricing: 52 }, 'idt-xgen': { share: 6.5, pricing: 68 }, 'neb-ultraii': { share: 4.2, pricing: 55 }, 'oncomine-dx': { share: 6.8, pricing: 82 }, 'miseq': { share: 16.5, pricing: 350 }, 'nextseq': { share: 14.2, pricing: 420 }, 'novaseq': { share: 12.8, pricing: 850 }, 'ion-s5': { share: 8.5, pricing: 280 }, 'mgi-seq': { share: 3.2, pricing: 120 }, 'element-aviti': { share: 0.8, pricing: 85 }, 'pacbio-revio': { share: 2.1, pricing: 350 }, 'oxford-minion': { share: 1.5, pricing: 80 }, 'dragen': { share: 11.5, pricing: 0 }, 'sophia-ddm': { share: 7.2, pricing: 95 }, 'qci-interpret': { share: 9.8, pricing: 48 }, 'velsera-cg': { share: 3.1, pricing: 0 }, 'illumina-basespace': { share: 16.2, pricing: 0 }, 'archer-fusionplex': { share: 2.4, pricing: 89 }, 'hamilton-ngs': { share: 8.9, pricing: 280 }, 'tecan-fluent': { share: 4.2, pricing: 225 } } },
  { quarter: '2025-Q1', data: { 'qiagen-ffpe-ext': { share: 14.9, pricing: 8 }, 'qiagen-blood-ext': { share: 12.1, pricing: 5 }, 'roche-magna-ext': { share: 13.4, pricing: 7 }, 'thermo-magmax-ext': { share: 12.6, pricing: 6 }, 'illumina-dna-prep': { share: 18.0, pricing: 42 }, 'illumina-tso500': { share: 8.3, pricing: 78 }, 'agilent-sureselect': { share: 14.0, pricing: 65 }, 'twist-panels': { share: 6.1, pricing: 75 }, 'kapa-hyperprep': { share: 11.0, pricing: 52 }, 'idt-xgen': { share: 6.7, pricing: 68 }, 'neb-ultraii': { share: 4.4, pricing: 55 }, 'oncomine-dx': { share: 6.9, pricing: 82 }, 'miseq': { share: 16.2, pricing: 350 }, 'nextseq': { share: 13.9, pricing: 420 }, 'novaseq': { share: 12.5, pricing: 850 }, 'ion-s5': { share: 8.3, pricing: 280 }, 'mgi-seq': { share: 3.8, pricing: 120 }, 'element-aviti': { share: 1.5, pricing: 85 }, 'pacbio-revio': { share: 2.3, pricing: 350 }, 'oxford-minion': { share: 1.8, pricing: 80 }, 'dragen': { share: 12.0, pricing: 0 }, 'sophia-ddm': { share: 7.4, pricing: 95 }, 'qci-interpret': { share: 10.0, pricing: 48 }, 'velsera-cg': { share: 3.3, pricing: 0 }, 'illumina-basespace': { share: 16.4, pricing: 0 }, 'archer-fusionplex': { share: 2.6, pricing: 89 }, 'hamilton-ngs': { share: 9.1, pricing: 280 }, 'tecan-fluent': { share: 4.4, pricing: 225 } } },
  { quarter: '2025-Q2', data: { 'qiagen-ffpe-ext': { share: 15.0, pricing: 8 }, 'qiagen-blood-ext': { share: 12.2, pricing: 5 }, 'roche-magna-ext': { share: 13.5, pricing: 7 }, 'thermo-magmax-ext': { share: 12.7, pricing: 6 }, 'illumina-dna-prep': { share: 17.8, pricing: 42 }, 'illumina-tso500': { share: 8.1, pricing: 78 }, 'agilent-sureselect': { share: 13.9, pricing: 65 }, 'twist-panels': { share: 6.3, pricing: 75 }, 'kapa-hyperprep': { share: 10.9, pricing: 52 }, 'idt-xgen': { share: 6.8, pricing: 68 }, 'neb-ultraii': { share: 4.5, pricing: 55 }, 'oncomine-dx': { share: 7.0, pricing: 82 }, 'miseq': { share: 15.9, pricing: 350 }, 'nextseq': { share: 13.6, pricing: 420 }, 'novaseq': { share: 12.2, pricing: 850 }, 'ion-s5': { share: 8.1, pricing: 280 }, 'mgi-seq': { share: 4.4, pricing: 120 }, 'element-aviti': { share: 2.2, pricing: 85 }, 'pacbio-revio': { share: 2.5, pricing: 350 }, 'oxford-minion': { share: 2.1, pricing: 80 }, 'dragen': { share: 12.4, pricing: 0 }, 'sophia-ddm': { share: 7.6, pricing: 95 }, 'qci-interpret': { share: 10.2, pricing: 48 }, 'velsera-cg': { share: 3.5, pricing: 0 }, 'illumina-basespace': { share: 16.5, pricing: 0 }, 'archer-fusionplex': { share: 2.8, pricing: 89 }, 'hamilton-ngs': { share: 9.2, pricing: 280 }, 'tecan-fluent': { share: 4.6, pricing: 225 } } },
  { quarter: '2025-Q3', data: { 'qiagen-ffpe-ext': { share: 15.1, pricing: 8 }, 'qiagen-blood-ext': { share: 12.2, pricing: 5 }, 'roche-magna-ext': { share: 13.6, pricing: 7 }, 'thermo-magmax-ext': { share: 12.8, pricing: 6 }, 'illumina-dna-prep': { share: 17.5, pricing: 42 }, 'illumina-tso500': { share: 8.0, pricing: 78 }, 'agilent-sureselect': { share: 13.8, pricing: 65 }, 'twist-panels': { share: 6.5, pricing: 75 }, 'kapa-hyperprep': { share: 10.8, pricing: 52 }, 'idt-xgen': { share: 6.9, pricing: 68 }, 'neb-ultraii': { share: 4.6, pricing: 55 }, 'oncomine-dx': { share: 7.1, pricing: 82 }, 'miseq': { share: 15.6, pricing: 350 }, 'nextseq': { share: 13.4, pricing: 420 }, 'novaseq': { share: 11.9, pricing: 850 }, 'ion-s5': { share: 7.9, pricing: 280 }, 'mgi-seq': { share: 5.1, pricing: 120 }, 'element-aviti': { share: 2.9, pricing: 85 }, 'pacbio-revio': { share: 2.7, pricing: 350 }, 'oxford-minion': { share: 2.3, pricing: 80 }, 'dragen': { share: 12.7, pricing: 0 }, 'sophia-ddm': { share: 7.8, pricing: 95 }, 'qci-interpret': { share: 10.4, pricing: 48 }, 'velsera-cg': { share: 3.7, pricing: 0 }, 'illumina-basespace': { share: 16.6, pricing: 0 }, 'archer-fusionplex': { share: 2.9, pricing: 89 }, 'hamilton-ngs': { share: 9.3, pricing: 280 }, 'tecan-fluent': { share: 4.7, pricing: 225 } } },
  { quarter: '2025-Q4', data: { 'qiagen-ffpe-ext': { share: 15.1, pricing: 8 }, 'qiagen-blood-ext': { share: 12.2, pricing: 5 }, 'roche-magna-ext': { share: 13.5, pricing: 7 }, 'thermo-magmax-ext': { share: 12.8, pricing: 6 }, 'illumina-dna-prep': { share: 17.2, pricing: 42 }, 'illumina-tso500': { share: 7.9, pricing: 78 }, 'agilent-sureselect': { share: 13.7, pricing: 65 }, 'twist-panels': { share: 6.6, pricing: 75 }, 'kapa-hyperprep': { share: 10.7, pricing: 52 }, 'idt-xgen': { share: 7.0, pricing: 68 }, 'neb-ultraii': { share: 4.7, pricing: 55 }, 'oncomine-dx': { share: 7.1, pricing: 82 }, 'miseq': { share: 15.4, pricing: 350 }, 'nextseq': { share: 13.2, pricing: 420 }, 'novaseq': { share: 11.7, pricing: 850 }, 'ion-s5': { share: 7.7, pricing: 280 }, 'mgi-seq': { share: 5.6, pricing: 120 }, 'element-aviti': { share: 3.4, pricing: 85 }, 'pacbio-revio': { share: 2.8, pricing: 350 }, 'oxford-minion': { share: 2.4, pricing: 80 }, 'dragen': { share: 13.0, pricing: 0 }, 'sophia-ddm': { share: 7.9, pricing: 95 }, 'qci-interpret': { share: 10.5, pricing: 48 }, 'velsera-cg': { share: 3.8, pricing: 0 }, 'illumina-basespace': { share: 16.7, pricing: 0 }, 'archer-fusionplex': { share: 3.0, pricing: 89 }, 'hamilton-ngs': { share: 9.4, pricing: 280 }, 'tecan-fluent': { share: 4.8, pricing: 225 } } },
  { quarter: '2026-Q1', data: { 'qiagen-ffpe-ext': { share: 15.1, pricing: 8 }, 'qiagen-blood-ext': { share: 12.2, pricing: 5 }, 'roche-magna-ext': { share: 13.7, pricing: 7 }, 'thermo-magmax-ext': { share: 12.9, pricing: 6 }, 'illumina-dna-prep': { share: 17.0, pricing: 42 }, 'illumina-tso500': { share: 7.8, pricing: 78 }, 'agilent-sureselect': { share: 13.6, pricing: 65 }, 'twist-panels': { share: 6.8, pricing: 75 }, 'kapa-hyperprep': { share: 10.6, pricing: 52 }, 'idt-xgen': { share: 7.1, pricing: 68 }, 'neb-ultraii': { share: 4.8, pricing: 55 }, 'oncomine-dx': { share: 7.2, pricing: 82 }, 'miseq': { share: 15.2, pricing: 350 }, 'nextseq': { share: 13.1, pricing: 420 }, 'novaseq': { share: 11.6, pricing: 850 }, 'ion-s5': { share: 7.6, pricing: 280 }, 'mgi-seq': { share: 6.1, pricing: 120 }, 'element-aviti': { share: 4.0, pricing: 85 }, 'pacbio-revio': { share: 2.9, pricing: 350 }, 'oxford-minion': { share: 2.5, pricing: 80 }, 'dragen': { share: 13.2, pricing: 0 }, 'sophia-ddm': { share: 8.1, pricing: 95 }, 'qci-interpret': { share: 10.7, pricing: 48 }, 'velsera-cg': { share: 3.9, pricing: 0 }, 'illumina-basespace': { share: 16.8, pricing: 0 }, 'archer-fusionplex': { share: 3.1, pricing: 89 }, 'hamilton-ngs': { share: 9.5, pricing: 280 }, 'tecan-fluent': { share: 4.9, pricing: 225 } } },
];

const MARKET_SIZE = {
  byCategory: { 'Extraction': 1800, 'Library Prep': 2400, 'Automation': 1200, 'Sequencing': 8500, 'Analysis': 3200, 'Reporting': 1400 },
  byIndication: { solid_tumor: 5200, liquid_biopsy: 3800, hereditary_cancer: 2100, heme_malig: 1600, rare_disease: 1800, pharmacogenomics: 900, hla_typing: 600, infectious_disease: 2500 },
  byRegion: { na: 0.42, we: 0.28, hg: 0.22, od: 0.08 },
  totalNGS: 18500,
  cagr: 0.142,
  year: 2026,
  futureCategories: { 'Proteomics': 2800, 'Spatial Biology': 1200, 'Long-Read Sequencing': 1800, 'Epigenomics': 600, 'Single-Cell Multi-omics': 900 },
};

const INTEL_SIGNALS = [
  { id: 'sig-1', date: '2026-03-15', type: 'regulatory', vendor: 'illumina', title: 'FDA clearance: DRAGEN OncoPipeline v4', impact: 'high', summary: 'Illumina DRAGEN OncoPipeline v4 receives FDA 510(k) clearance enabling on-instrument IVD analysis', source: 'FDA 510(k) database', products: ['illumina-dragen'] },
  { id: 'sig-2', date: '2026-03-10', type: 'pricing', vendor: 'element', title: 'Element AVITI24 pricing announced at $98/genome', impact: 'high', summary: 'Element Biosciences announces AVITI24 benchtop sequencer with $98 cost-per-genome, 5% lower than previous estimate', source: 'Element press release', products: ['element-aviti'] },
  { id: 'sig-3', date: '2026-03-05', type: 'product_launch', vendor: 'roche', title: 'Roche Axelios 1 SBX sequencer FDA 510(k) submission', impact: 'high', summary: 'Roche submits Axelios 1 SBX sequencer for FDA clearance targeting $150/genome with KAPA library prep', source: 'Roche investor call', products: ['roche-sbx'] },
  { id: 'sig-4', date: '2026-02-28', type: 'partnership', vendor: 'thermo', title: 'Thermo Fisher partners with Guardant for ctDNA panels', impact: 'medium', summary: 'Thermo Fisher licenses Guardant ctDNA panel designs for Oncomine platform integration', source: 'Deal announcement', products: ['thermo-oncomine', 'guardant-360'] },
  { id: 'sig-5', date: '2026-02-20', type: 'market_entry', vendor: 'mgi', title: 'MGI DNBSEQ-G99 US premarket review with FDA', impact: 'high', summary: 'MGI Tech initiates FDA premarket notification for DNBSEQ-G99 benchtop sequencer targeting US market entry Q3 2026', source: 'FDA CBER Communications', products: ['mgi-seq'] },
  { id: 'sig-6', date: '2026-02-15', type: 'acquisition', vendor: 'agilent', title: 'Agilent acquires NGS bioinformatics startup for $45M', impact: 'medium', summary: 'Agilent acquires specialized NGS variant calling software company to strengthen analysis portfolio', source: 'Deal press release', products: [] },
  { id: 'sig-7', date: '2026-02-10', type: 'clinical_data', vendor: 'natera', title: 'Natera Signatera MRD data from PERSIMMON study published', impact: 'medium', summary: 'Prospective MRD study shows improved relapse-free survival with Signatera monitoring in colorectal cancer', source: 'ASCO GI 2026', products: ['natera-signatera'] },
  { id: 'sig-8', date: '2026-02-05', type: 'regulatory', vendor: 'qiagen', title: 'Qiagen QCI-Advanced EU CE-IVD approval for germline interpretation', impact: 'medium', summary: 'Qiagen QCI-Advanced earns CE-IVD certification expanding diagnostic claim scope in Europe', source: 'Qiagen announcement', products: ['qci-interpret'] },
  { id: 'sig-9', date: '2026-01-30', type: 'pricing', vendor: 'ultima', title: 'Ultima Genomics announces $80/genome WGS pricing for bulk samples', impact: 'high', summary: 'Ultima achieves sustained $80/genome cost-per-base pricing on UG 200 platform for research WGS', source: 'Ultima investor presentation', products: ['ultima-ug200'] },
  { id: 'sig-10', date: '2026-01-25', type: 'product_launch', vendor: 'idt', title: 'IDT xGen UMI amplicon panels v2.0 launch', impact: 'medium', summary: 'IDT releases next-gen UMI amplicon panels with expanded tumor content and improved multiplexing', source: 'IDT new products', products: ['idt-xgen'] },
  { id: 'sig-11', date: '2026-01-20', type: 'partnership', vendor: 'sophia', title: 'SOPHiA Genetics partnership with major diagnostic LIS vendor', impact: 'medium', summary: 'SOPHiA integrates its platform with leading laboratory information system for seamless reporting', source: 'Partnership announcement', products: ['sophia-ddm'] },
  { id: 'sig-12', date: '2026-01-15', type: 'market_entry', vendor: 'pacbio', title: 'PacBio announces $80 sample pricing for HiFi WGS', impact: 'high', summary: 'PacBio sustainable pricing model enables $80/sample HiFi whole-genome sequencing at scale', source: 'PacBio earnings call', products: ['pacbio-revio'] },
  { id: 'sig-13', date: '2026-01-10', type: 'regulatory', vendor: 'invivoscribe', title: 'InvivoScribe LymphoTrack CDx expanded indication approval', impact: 'medium', summary: 'FDA expands InvivoScribe LymphoTrack CDx approval to include additional heme malignancy indications', source: 'FDA approval notice', products: ['invivoscribe-lymphotrack'] },
  { id: 'sig-14', date: '2026-01-05', type: 'clinical_data', vendor: 'foundation', title: 'Foundation Medicine Liquid CDx data improves liquid biopsy market positioning', impact: 'medium', summary: 'New FoundationOne Liquid CDx data in large patient cohorts supports expanded clinical adoption', source: 'AACR 2026', products: ['foundation-fone-liquid'] },
  { id: 'sig-15', date: '2025-12-20', type: 'pricing', vendor: 'twist', title: 'Twist Bioscience panel pricing reduction in high-volume tiers', impact: 'medium', summary: 'Twist introduces aggressive volume discounting on exome and cancer panels to drive adoption', source: 'Twist pricing updates', products: ['twist-panels'] },
];

const COST_COMPONENTS = {
  'qiagen-ffpe-ext': { reagents: 4.50, instrument_amortized: 0.8, labor: 1.5, qc: 0.6, total: 7.4 },
  'qiagen-blood-ext': { reagents: 2.50, instrument_amortized: 0.5, labor: 1.0, qc: 0.4, total: 4.4 },
  'roche-magna-ext': { reagents: 3.50, instrument_amortized: 0.8, labor: 1.2, qc: 0.5, total: 6.0 },
  'thermo-magmax-ext': { reagents: 3.0, instrument_amortized: 0.7, labor: 1.0, qc: 0.4, total: 5.1 },
  'promega-ffpe-ext': { reagents: 4.75, instrument_amortized: 0.8, labor: 1.5, qc: 0.6, total: 7.65 },
  'beckman-ampure-ext': { reagents: 1.80, instrument_amortized: 0.6, labor: 0.8, qc: 0.3, total: 3.5 },
  'illumina-dna-prep': { reagents: 28.0, instrument_amortized: 2.5, labor: 4.0, qc: 2.0, total: 36.5 },
  'illumina-tso500': { reagents: 52.0, instrument_amortized: 3.5, labor: 6.0, qc: 3.0, total: 64.5 },
  'agilent-sureselect': { reagents: 44.0, instrument_amortized: 3.0, labor: 5.5, qc: 2.5, total: 55.0 },
  'twist-panels': { reagents: 50.0, instrument_amortized: 2.0, labor: 5.0, qc: 2.0, total: 59.0 },
  'kapa-hyperprep': { reagents: 35.0, instrument_amortized: 2.2, labor: 4.5, qc: 1.8, total: 43.5 },
  'idt-xgen': { reagents: 45.0, instrument_amortized: 2.5, labor: 5.0, qc: 2.2, total: 54.7 },
  'neb-ultraii': { reagents: 38.0, instrument_amortized: 2.0, labor: 4.0, qc: 1.5, total: 45.5 },
  'oncomine-dx': { reagents: 55.0, instrument_amortized: 3.0, labor: 6.0, qc: 3.0, total: 67.0 },
  'miseq': { reagents: 210.0, instrument_amortized: 15.0, labor: 8.0, qc: 5.0, total: 238.0 },
  'nextseq': { reagents: 280.0, instrument_amortized: 18.0, labor: 9.0, qc: 6.0, total: 313.0 },
  'novaseq': { reagents: 650.0, instrument_amortized: 45.0, labor: 12.0, qc: 8.0, total: 715.0 },
  'ion-s5': { reagents: 180.0, instrument_amortized: 12.0, labor: 7.0, qc: 4.5, total: 203.5 },
  'mgi-seq': { reagents: 95.0, instrument_amortized: 8.0, labor: 6.0, qc: 3.5, total: 112.5 },
  'element-aviti': { reagents: 68.0, instrument_amortized: 6.0, labor: 7.0, qc: 3.5, total: 84.5 },
  'hamilton-ngs': { reagents: 0, instrument_amortized: 12.0, labor: 8.0, qc: 0, total: 20.0 },
  'tecan-fluent': { reagents: 0, instrument_amortized: 8.0, labor: 6.0, qc: 0, total: 14.0 },
  'dragen': { reagents: 0, instrument_amortized: 2.0, labor: 0.5, qc: 0, total: 2.5 },
  'sophia-ddm': { reagents: 0, instrument_amortized: 0, labor: 1.5, qc: 0.5, total: 2.0 },
  'qci-interpret': { reagents: 0, instrument_amortized: 0, labor: 2.0, qc: 0.5, total: 2.5 },
};

// MULTI-OMICS CATEGORIES (future): ['Proteomics', 'Spatial Biology', 'Long-Read Sequencing', 'Epigenomics', 'Single-Cell Multi-omics']

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
    'FDA PMA': 'bg-blue-900 text-blue-200',
    'FDA 510(k)': 'bg-blue-800 text-blue-200',
    'FDA EUA': 'bg-purple-900 text-purple-200',
    'CE-IVDR': 'bg-green-900 text-green-200',
    'CE-IVD': 'bg-green-800 text-green-300',
    'CLIA/CAP': 'bg-yellow-900 text-yellow-200',
    'ISO 13485': 'bg-gray-700 text-gray-300',
    'RUO': 'bg-gray-800 text-gray-400',
  };
  return colors[regulatory] || 'bg-gray-800 text-gray-400';
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categoryOpts = ['All', ...CATEGORIES];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const vendorShares = useMemo(() => {
    const vendorMap = {};
    filteredProducts.forEach(p => {
      if (!vendorMap[p.vendor]) vendorMap[p.vendor] = 0;
      vendorMap[p.vendor] += p.share || 0;
    });
    return Object.entries(vendorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([key]) => key);
  }, [filteredProducts]);

  const getCellData = useCallback((vendorKey, indicationKey) => {
    const vendorProds = filteredProducts.filter(p => p.vendor === vendorKey && p.indications?.includes(indicationKey));
    const count = vendorProds.length;
    let maxShare = 0;
    let totalShare = 0;
    vendorProds.forEach(p => {
      const s = p.indicationShare?.[indicationKey]?.global || 0;
      if (s > maxShare) maxShare = s;
      totalShare += s;
    });
    return { count, maxShare, totalShare };
  }, [filteredProducts]);

  const catColors = { 'All': '#9ca3af', 'Extraction': '#f59e0b', 'Library Prep': '#3b82f6', 'Automation': '#8b5cf6', 'Sequencing': '#ef4444', 'Analysis': '#10b981', 'Reporting': '#ec4899' };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 overflow-x-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white">Vendor-Indication Matrix</h3>
        <div className="flex gap-1 flex-wrap">
          {categoryOpts.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedCategory === cat ? 'text-white ring-1 ring-white/30' : 'text-gray-400 hover:text-gray-200'}`}
              style={selectedCategory === cat ? { backgroundColor: catColors[cat] + 'aa' } : {}}
            >{cat}</button>
          ))}
        </div>
      </div>
      {vendorShares.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-8">No vendors with products in {selectedCategory} targeting clinical indications</div>
      ) : (
        <div className="inline-block">
          <div className="flex">
            <div className="w-40"></div>
            <div className="flex gap-0">
              {INDICATIONS.map(ind => (
                <div key={ind.key} className="w-20 text-center">
                  <div className="text-xs text-gray-400">{ind.icon}</div>
                  <div className="text-xs text-gray-500 truncate" title={ind.label}>{ind.label}</div>
                </div>
              ))}
            </div>
          </div>
          {vendorShares.map(vendorKey => {
            const vendor = VENDORS.find(v => v.key === vendorKey);
            return (
              <div key={vendorKey} className="flex">
                <div className="w-40 pr-3 py-2 text-sm font-medium text-gray-300 text-right truncate" title={vendor?.label}>{vendor?.label}</div>
                <div className="flex gap-0">
                  {INDICATIONS.map(ind => {
                    const { count, maxShare, totalShare } = getCellData(vendorKey, ind.key);
                    const intensity = count === 0 ? 0 : count === 1 ? 0.3 : count === 2 ? 0.5 : 0.7;
                    const displayVal = maxShare > 0 ? `${maxShare}%` : count > 0 ? count : '';
                    return (
                      <div
                        key={ind.key}
                        className="w-20 h-12 flex items-center justify-center border border-gray-800"
                        style={count > 0 ? { backgroundColor: `${ind.color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}` } : {}}
                        title={`${vendor?.label} × ${ind.label}${selectedCategory !== 'All' ? ` (${selectedCategory})` : ''}: ${count} product${count !== 1 ? 's' : ''}${maxShare > 0 ? `, top share ${maxShare}%` : ''}`}
                      >
                        {displayVal && <span className="text-xs font-bold" style={{ color: maxShare > 0 ? '#ffffff' : ind.color }}>{displayVal}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>Showing: <span className="text-gray-300 font-medium">{selectedCategory}</span></span>
            <span>{vendorShares.length} vendors</span>
            <span>{filteredProducts.length} products</span>
            <span className="flex items-center gap-1">Intensity = product count per cell</span>
          </div>
        </div>
      )}
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
    const sixMonthsAgo = '2025-Q3';
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

const Sidebar = ({ activeView, setActiveView, indicationFilter }) => {
  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { name: 'Dashboard', key: 'dashboard' },
      ],
    },
    {
      group: 'EXPLORE',
      items: [
        { name: 'Products', key: 'products' },
        { name: 'Vendors', key: 'vendors' },
        { name: 'Compare', key: 'compare' },
      ],
    },
    {
      group: 'WORKFLOW',
      items: [
        { name: 'Compatibility', key: 'compatibility' },
        { name: 'TCO Calculator', key: 'tco' },
      ],
    },
    {
      group: 'STRATEGY',
      items: [
        { name: 'Indication Strategy', key: 'indication' },
        { name: 'Scenarios', key: 'scenarios' },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { name: 'Timeline', key: 'timeline' },
        { name: 'Signals', key: 'signals' },
      ],
    },
    {
      group: 'META',
      items: [
        { name: 'Data Quality', key: 'data quality' },
        { name: 'Regulatory', key: 'regulatory' },
      ],
    },
  ];

  return (
    <div className="w-56 bg-gray-900 border-r border-gray-800 p-6 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">NGS Intel v4</h1>
        <p className="text-xs text-gray-400">Market Intelligence Platform</p>
      </div>

      <nav className="space-y-6">
        {navGroups.map((group, i) => (
          <div key={i}>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{group.group}</h2>
            <div className="space-y-1">
              {group.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {indicationFilter.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Filter:</p>
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
};

const SAMPLE_TYPE_LABELS = { ffpe: 'FFPE', blood: 'Blood', cfdna: 'cfDNA', tissue: 'Tissue', saliva: 'Saliva' };
const NUCLEIC_ACID_LABELS = { dna: 'DNA', rna: 'RNA' };

// ============================================
// UTILITY COMPONENTS
// ============================================

const MiniSparkline = ({ productId, metric = 'share', width = 80, height = 24 }) => {
  const history = useMemo(() => {
    return HISTORICAL_SNAPSHOTS.map(s => ({
      q: s.quarter,
      value: s.data[productId]?.[metric] ?? null
    })).filter(d => d.value !== null);
  }, [productId, metric]);
  if (history.length < 2) return null;
  const min = Math.min(...history.map(d => d.value));
  const max = Math.max(...history.map(d => d.value));
  const first = history[0].value;
  const last = history[history.length - 1].value;
  const color = last >= first ? '#10b981' : '#ef4444';
  return (
    <div className="inline-flex items-center gap-1" title={`${history[0].q}: ${first.toFixed(1)} → ${history[history.length-1].q}: ${last.toFixed(1)}`}>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={history}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <span className="text-xs font-semibold" style={{color}}>{last > first ? '+' : ''}{(last - first).toFixed(1)}</span>
    </div>
  );
};

const TAMOverlay = ({ share, category, indication }) => {
  const tam = category ? MARKET_SIZE.byCategory[category] : indication ? MARKET_SIZE.byIndication[indication] : MARKET_SIZE.totalNGS;
  if (!tam || !share) return null;
  const dollarValue = ((share / 100) * tam).toFixed(0);
  return <span className="text-xs text-emerald-400 ml-1" title={`${share}% of $${tam}M TAM`}>(${dollarValue}M)</span>;
};

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
          <div className="flex justify-between items-center">
            <span>Market Share:</span>
            <span className="font-bold text-white flex items-center gap-1">
              {product.share}%
              <ConfidenceDot conf={product.confidence?.share} />
              <MiniSparkline productId={product.id} metric="share" width={60} height={18} />
              <TAMOverlay share={product.share} category={product.category} />
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
  const [regionKey, setRegionKey] = useState('global');
  const regionOpts = [
    { key: 'global', label: 'Global', color: '#3b82f6' },
    { key: 'na', label: 'NA', color: '#ef4444' },
    { key: 'we', label: 'WE', color: '#10b981' },
    { key: 'hg', label: 'HG', color: '#f59e0b' },
    { key: 'od', label: 'OD', color: '#8b5cf6' },
  ];

  const data = useMemo(() => {
    const vendorMap = {};
    products.forEach(p => {
      if (!vendorMap[p.vendor]) {
        const v = VENDORS.find(v => v.key === p.vendor);
        vendorMap[p.vendor] = { vendor: v?.label || p.vendor, totalShare: 0, products: 0, color: v?.color || '#6b7280', categories: new Set() };
      }
      if (regionKey === 'global') {
        vendorMap[p.vendor].totalShare += (p.share || 0);
      } else {
        vendorMap[p.vendor].totalShare += (p.regionalShare?.[regionKey] || 0);
      }
      vendorMap[p.vendor].products++;
      vendorMap[p.vendor].categories.add(p.category);
    });
    return Object.values(vendorMap)
      .map(v => ({ ...v, categories: v.categories.size, label: `${v.vendor} (${v.products})` }))
      .sort((a, b) => b.totalShare - a.totalShare)
      .slice(0, 12);
  }, [products, regionKey]);

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {regionOpts.map(r => (
          <button key={r.key} onClick={() => setRegionKey(r.key)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${regionKey === r.key ? 'text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
            style={regionKey === r.key ? { backgroundColor: r.color } : {}}>
            {r.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 20, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" label={{ value: 'Total Share %', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 11 }} />
          <YAxis dataKey="vendor" type="category" stroke="#9ca3af" width={130} fontSize={11} interval={0} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            formatter={(val, name, entry) => [`${Math.round(val)}% across ${entry.payload.products} products in ${entry.payload.categories} categories`, 'Combined Share']}
          />
          <Bar dataKey="totalShare" radius={[0, 6, 6, 0]}>
            {data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SequencerLandscape = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState('Sequencing');
  const catColors = { 'Extraction': '#f59e0b', 'Library Prep': '#3b82f6', 'Automation': '#8b5cf6', 'Sequencing': '#ef4444', 'Analysis': '#10b981', 'Reporting': '#ec4899' };

  const data = useMemo(() => {
    return products
      .filter(p => p.category === selectedCategory)
      .map(p => {
        const v = VENDORS.find(v => v.key === p.vendor);
        return { name: p.name, share: p.share || 0, pricing: p.pricing || 0, vendor: v?.label || p.vendor, color: v?.color || '#6b7280', tier: p.tier, regulatory: p.regulatory, category: p.category };
      });
  }, [products, selectedCategory]);

  const maxShare = useMemo(() => Math.max(...data.map(d => d.share), 1), [data]);

  return (
    <div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedCategory === cat ? 'text-white ring-1 ring-white/30' : 'text-gray-400 hover:text-gray-200'}`}
            style={selectedCategory === cat ? { backgroundColor: catColors[cat] + 'aa' } : {}}
          >{cat}</button>
        ))}
      </div>
      {data.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-12">No products with pricing data in {selectedCategory}</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="pricing" stroke="#9ca3af" name="Price" unit="" label={{ value: 'Cost per Sample ($)', position: 'insideBottom', offset: -10, fill: '#9ca3af', fontSize: 11 }} />
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
                    <p className="text-gray-400">{d.vendor} · {d.category} · Tier {d.tier}</p>
                    <p className="text-blue-400">Share: {d.share}% · Cost: ${d.pricing}/sample</p>
                    <p className="text-green-400">{d.regulatory}</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} shape="circle">
              {data.map((entry, idx) => <Cell key={idx} fill={entry.color} r={Math.max(5, Math.min(25, (entry.share / maxShare) * 25))} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
      <div className="mt-1 text-xs text-gray-500 text-center">{data.length} products in {selectedCategory} · Bubble size = relative market share</div>
    </div>
  );
};

const RegionalDistribution = ({ products }) => {
  const [regionKey, setRegionKey] = useState('na');
  const regions = [
    { key: 'na', label: 'North America', color: '#ef4444' },
    { key: 'we', label: 'W. Europe', color: '#10b981' },
    { key: 'hg', label: 'High-Growth', color: '#f59e0b' },
    { key: 'od', label: 'Other Dev.', color: '#8b5cf6' },
  ];

  const data = useMemo(() => {
    const vendorMap = {};
    products.forEach(p => {
      if (!p.regionalShare) return;
      const rShare = p.regionalShare[regionKey] || 0;
      if (!vendorMap[p.vendor]) {
        const v = VENDORS.find(v => v.key === p.vendor);
        vendorMap[p.vendor] = { vendor: v?.label || p.vendor, share: 0, products: 0, color: v?.color || '#6b7280', categories: new Set() };
      }
      vendorMap[p.vendor].share += rShare;
      vendorMap[p.vendor].products++;
      vendorMap[p.vendor].categories.add(p.category);
    });
    return Object.values(vendorMap)
      .map(v => ({ ...v, categories: v.categories.size }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 10);
  }, [products, regionKey]);

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {regions.map(r => (
          <button key={r.key} onClick={() => setRegionKey(r.key)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${regionKey === r.key ? 'text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
            style={regionKey === r.key ? { backgroundColor: r.color } : {}}>
            {r.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" label={{ value: 'Combined Regional Share %', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 11 }} />
          <YAxis dataKey="vendor" type="category" stroke="#9ca3af" width={120} fontSize={11} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            formatter={(val, name, entry) => [`${Math.round(val)}% across ${entry.payload.products} products in ${entry.payload.categories} categories`, 'Regional Share']}
          />
          <Bar dataKey="share" radius={[0, 6, 6, 0]}>
            {data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const GrowthDistribution = ({ products }) => {
  const data = useMemo(() => {
    const vendorMap = {};
    products.forEach(p => {
      if (!p.growth || !p.share) return;
      if (!vendorMap[p.vendor]) {
        const v = VENDORS.find(v => v.key === p.vendor);
        vendorMap[p.vendor] = { vendor: v?.label || p.vendor, growing: 0, emerging: 0, declining: 0, stable: 0, color: v?.color || '#6b7280' };
      }
      vendorMap[p.vendor][p.growth] += p.share;
    });
    return Object.values(vendorMap)
      .map(v => ({ ...v, momentum: v.growing + v.emerging - v.declining }))
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, 12);
  }, [products]);

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 20, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis type="number" stroke="#9ca3af" label={{ value: 'Share Momentum (Growing+Emerging−Declining)', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 10 }} />
        <YAxis dataKey="vendor" type="category" stroke="#9ca3af" width={130} fontSize={11} interval={0} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm">
                <p className="font-bold text-white">{d.vendor}</p>
                <p className="text-green-400">Growing: {d.growing.toFixed(1)}% · Emerging: {d.emerging.toFixed(1)}%</p>
                <p className="text-gray-400">Stable: {d.stable.toFixed(1)}%</p>
                <p className="text-red-400">Declining: {d.declining.toFixed(1)}%</p>
                <p className="text-blue-400 font-medium mt-1">Net Momentum: {d.momentum > 0 ? '+' : ''}{d.momentum.toFixed(1)}%</p>
              </div>
            );
          }}
        />
        <Bar dataKey="momentum" radius={[0, 6, 6, 0]}>
          {data.map((entry, idx) => <Cell key={idx} fill={entry.momentum >= 0 ? '#10b981' : '#ef4444'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const SampleTypeBreakdown = ({ products }) => {
  const [viewMode, setViewMode] = useState('pricing');

  const pricingData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catProducts = products.filter(p => p.category === cat && p.pricing > 0);
      if (catProducts.length === 0) return { category: cat, avg: 0, min: 0, max: 0, count: 0 };
      const prices = catProducts.map(p => p.pricing);
      return {
        category: cat,
        avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        min: Math.min(...prices),
        max: Math.max(...prices),
        count: catProducts.length,
      };
    });
  }, [products]);

  const sampleData = useMemo(() => {
    const stMap = {};
    products.forEach(p => {
      (p.sampleTypes || []).forEach(st => {
        if (!stMap[st]) stMap[st] = { totalShare: 0, count: 0 };
        stMap[st].totalShare += (p.share || 0);
        stMap[st].count++;
      });
    });
    const colors = { ffpe: '#f59e0b', blood: '#ef4444', cfdna: '#3b82f6', tissue: '#10b981', saliva: '#a855f7' };
    const SAMPLE_TYPE_LABELS = { ffpe: 'FFPE', blood: 'Blood', cfdna: 'cfDNA', tissue: 'Tissue', saliva: 'Saliva' };
    return Object.entries(stMap).map(([key, val]) => ({
      name: SAMPLE_TYPE_LABELS[key] || key,
      share: Math.round(val.totalShare * 10) / 10,
      count: val.count,
      color: colors[key] || '#6b7280',
    })).sort((a, b) => b.share - a.share);
  }, [products]);

  return (
    <div>
      <div className="flex gap-1 mb-3">
        <button onClick={() => setViewMode('pricing')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'pricing' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
          Pricing by Category
        </button>
        <button onClick={() => setViewMode('sample')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'sample' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
          Sample Type Share
        </button>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        {viewMode === 'pricing' ? (
          <BarChart data={pricingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="category" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" label={{ value: 'Price per Sample ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm">
                    <p className="font-bold text-white">{d.category}</p>
                    <p className="text-blue-400">Avg: ${d.avg} · Range: ${d.min}–${d.max}</p>
                    <p className="text-gray-400">{d.count} products</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Price" />
          </BarChart>
        ) : (
          <BarChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" label={{ value: 'Combined Share %', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              formatter={(val, name, entry) => [`${val}% (${entry.payload.count} products)`, 'Combined Share']}
            />
            <Bar dataKey="share" radius={[4, 4, 0, 0]}>
              {sampleData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
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

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Signals</h3>
          <div className="space-y-2">
            {INTEL_SIGNALS.filter(s => s.impact === 'high').slice(0, 3).map(signal => (
              <div key={signal.id} className="bg-gray-900 rounded p-2 text-xs border border-gray-700">
                <div className="font-semibold text-white truncate">{signal.title.substring(0, 40)}</div>
                <div className="text-gray-500 text-[10px] mt-1">{signal.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Market Sizing (TAM)</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Total NGS:</span>
              <span className="font-bold text-emerald-400">${MARKET_SIZE.totalNGS}M</span>
            </div>
            <div className="text-gray-500 text-[10px] space-y-0.5 mt-2">
              <div>Sequencing: ${MARKET_SIZE.byCategory['Sequencing']}M</div>
              <div>Analysis: ${MARKET_SIZE.byCategory['Analysis']}M</div>
              <div>Library Prep: ${MARKET_SIZE.byCategory['Library Prep']}M</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">CAGR & Projections</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>NGS CAGR:</span>
              <span className="font-bold text-blue-400">{(MARKET_SIZE.cagr * 100).toFixed(1)}%</span>
            </div>
            <div className="text-gray-500 text-[10px] mt-2">
              Projected 2026-2031 TAM growth driven by NGS expansion in liquid biopsy and germline testing
            </div>
          </div>
        </div>
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
        <h2 className="text-lg font-bold text-white mb-4">Product Landscape: Share vs. Cost</h2>
        <p className="text-gray-500 text-xs mb-3">Compare products by market share and cost across any workflow step. Hover for details.</p>
        <SequencerLandscape products={filteredProducts} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Top Vendors by Region</h2>
          <p className="text-gray-500 text-xs mb-3">Who dominates each region? Switch regions to compare vendor rankings.</p>
          <RegionalDistribution products={filteredProducts} />
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Growth Momentum by Vendor</h2>
          <p className="text-gray-500 text-xs mb-3">Net momentum = growing + emerging − declining product share.</p>
          <GrowthDistribution products={filteredProducts} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold text-white mb-4">Pricing & Sample Intelligence</h2>
        <p className="text-gray-500 text-xs mb-3">Average pricing per workflow category. Toggle to see sample type market share.</p>
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

      {/* Product Analytics */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {/* Regulatory Breakdown Pie */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-2">Regulatory Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={(() => {
                  const counts = {};
                  filteredProducts.forEach(p => { counts[p.regulatory] = (counts[p.regulatory] || 0) + 1; });
                  const colors = { 'FDA PMA': '#10b981', 'FDA 510(k)': '#34d399', 'CE-IVD': '#3b82f6', 'CE-IVDR': '#6366f1', 'RUO': '#6b7280', 'CLIA/CAP': '#f59e0b', 'ISO 13485': '#8b5cf6', 'Open Source': '#06b6d4' };
                  return Object.entries(counts).map(([key, val]) => ({ name: key, value: val, color: colors[key] || '#6b7280' })).sort((a, b) => b.value - a.value);
                })()} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {(() => {
                    const counts = {};
                    filteredProducts.forEach(p => { counts[p.regulatory] = (counts[p.regulatory] || 0) + 1; });
                    const colors = { 'FDA PMA': '#10b981', 'FDA 510(k)': '#34d399', 'CE-IVD': '#3b82f6', 'CE-IVDR': '#6366f1', 'RUO': '#6b7280', 'CLIA/CAP': '#f59e0b', 'ISO 13485': '#8b5cf6', 'Open Source': '#06b6d4' };
                    return Object.entries(counts).map(([key], idx) => <Cell key={idx} fill={colors[key] || '#6b7280'} />);
                  })()}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Growth Status Breakdown */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-2">Growth Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={(() => {
                const growthMap = { growing: { label: 'Growing', color: '#10b981', count: 0, share: 0 }, emerging: { label: 'Emerging', color: '#3b82f6', count: 0, share: 0 }, stable: { label: 'Stable', color: '#6b7280', count: 0, share: 0 }, declining: { label: 'Declining', color: '#ef4444', count: 0, share: 0 } };
                filteredProducts.forEach(p => { if (p.growth && growthMap[p.growth]) { growthMap[p.growth].count++; growthMap[p.growth].share += (p.share || 0); } });
                return Object.values(growthMap).filter(g => g.count > 0);
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(val, name, entry) => [name === 'count' ? `${val} products` : `${val.toFixed(1)}% share`, name === 'count' ? 'Products' : 'Combined Share']} />
                <Bar dataKey="count" name="count" radius={[4, 4, 0, 0]}>
                  {(() => {
                    const growthMap = { growing: '#10b981', emerging: '#3b82f6', stable: '#6b7280', declining: '#ef4444' };
                    const data = [];
                    filteredProducts.forEach(p => { if (p.growth && !data.includes(p.growth)) data.push(p.growth); });
                    return Object.keys(growthMap).filter(k => data.includes(k) || true).map((k, i) => <Cell key={i} fill={growthMap[k]} />);
                  })()}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Price Distribution by Category */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-2">Avg Price by Category</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={(() => {
                const catMap = {};
                filteredProducts.forEach(p => {
                  if (!catMap[p.category]) catMap[p.category] = { category: p.category, total: 0, count: 0 };
                  if (p.pricing > 0) { catMap[p.category].total += p.pricing; catMap[p.category].count++; }
                });
                return Object.values(catMap).map(c => ({ ...c, avg: c.count > 0 ? Math.round(c.total / c.count) : 0 })).filter(c => c.avg > 0);
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(val, name, entry) => [`$${val} avg (${entry.payload.count} products)`, 'Avg Price']} />
                <Bar dataKey="avg" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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

      {/* Vendor Analytics */}
      {vendorStats.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {/* Category Coverage Radar */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-2">Category Coverage (Top 8 Vendors)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={CATEGORIES.map(cat => {
                const entry = { category: cat };
                vendorStats.slice(0, 8).forEach(v => {
                  entry[v.label] = v.productList.filter(p => p.category === cat).reduce((s, p) => s + (p.share || 0), 0);
                });
                return entry;
              })}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="category" stroke="#9ca3af" fontSize={10} />
                {vendorStats.slice(0, 8).map((v, i) => (
                  <Radar key={v.key} name={v.label} dataKey={v.label} stroke={v.color} fill={v.color} fillOpacity={0.1} strokeWidth={2} />
                ))}
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Tier Distribution Across Vendors */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-2">Tier Distribution by Vendor (Top 12)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendorStats.slice(0, 12).map(v => ({
                vendor: v.label.length > 12 ? v.label.substring(0, 12) + '…' : v.label,
                'Tier A': v.tierCounts.A || 0,
                'Tier B': v.tierCounts.B || 0,
                'Tier C': v.tierCounts.C || 0,
              }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                <YAxis dataKey="vendor" type="category" stroke="#9ca3af" width={100} fontSize={10} interval={0} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Tier A" stackId="a" fill="#10b981" />
                <Bar dataKey="Tier B" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Tier C" stackId="a" fill="#6b7280" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
          { label: 'IVD Cleared', value: filteredProducts.filter(p => ['CE-IVD', 'CE-IVDR', 'FDA 510(k)', 'FDA PMA', 'FDA EUA'].includes(p.regulatory)).length },
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

      {/* Extended Analytics */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Regulatory Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-3">Regulatory Status by Vendor</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, vendorChartData.length * 28)}>
              <BarChart data={(() => {
                const map = {};
                filteredProducts.forEach(p => {
                  const v = VENDORS.find(v => v.key === p.vendor);
                  const vLabel = v?.label || p.vendor;
                  if (!map[vLabel]) map[vLabel] = { vendor: vLabel.length > 14 ? vLabel.substring(0, 14) + '…' : vLabel, 'IVD/Cleared': 0, 'RUO': 0, 'Service': 0 };
                  if (['CE-IVD','CE-IVDR','FDA PMA','FDA 510(k)','FDA EUA'].includes(p.regulatory)) map[vLabel]['IVD/Cleared']++;
                  else if (['CLIA/CAP'].includes(p.regulatory)) map[vLabel]['Service']++;
                  else map[vLabel]['RUO']++;
                });
                return Object.values(map).sort((a, b) => (b['IVD/Cleared'] + b['RUO'] + b['Service']) - (a['IVD/Cleared'] + a['RUO'] + a['Service'])).slice(0, 12);
              })()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                <YAxis dataKey="vendor" type="category" stroke="#9ca3af" width={110} fontSize={10} interval={0} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="IVD/Cleared" stackId="a" fill="#10b981" />
                <Bar dataKey="RUO" stackId="a" fill="#6b7280" />
                <Bar dataKey="Service" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Regional Share Radar */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-3">Regional Footprint (Top 6 Vendors)</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, vendorChartData.length * 28)}>
              <RadarChart data={[
                { region: 'North America', ...Object.fromEntries(vendorChartData.slice(0, 6).map(v => [v.vendor, filteredProducts.filter(p => VENDORS.find(vv => vv.key === p.vendor)?.label === v.vendor).reduce((s, p) => s + (p.regionalShare?.na || 0), 0)])) },
                { region: 'W. Europe', ...Object.fromEntries(vendorChartData.slice(0, 6).map(v => [v.vendor, filteredProducts.filter(p => VENDORS.find(vv => vv.key === p.vendor)?.label === v.vendor).reduce((s, p) => s + (p.regionalShare?.we || 0), 0)])) },
                { region: 'High-Growth', ...Object.fromEntries(vendorChartData.slice(0, 6).map(v => [v.vendor, filteredProducts.filter(p => VENDORS.find(vv => vv.key === p.vendor)?.label === v.vendor).reduce((s, p) => s + (p.regionalShare?.hg || 0), 0)])) },
                { region: 'Other Dev.', ...Object.fromEntries(vendorChartData.slice(0, 6).map(v => [v.vendor, filteredProducts.filter(p => VENDORS.find(vv => vv.key === p.vendor)?.label === v.vendor).reduce((s, p) => s + (p.regionalShare?.od || 0), 0)])) },
              ]}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="region" stroke="#9ca3af" fontSize={11} />
                {vendorChartData.slice(0, 6).map((v, i) => (
                  <Radar key={i} name={v.vendor} dataKey={v.vendor} stroke={v.color} fill={v.color} fillOpacity={0.1} strokeWidth={2} />
                ))}
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
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
// TCO CALCULATOR VIEW
// ============================================

const TCOCalculatorView = ({ products, indicationFilter }) => {
  const [workflow, setWorkflow] = useState({ extraction: null, libprep: null, automation: null, sequencing: null, analysis: null, reporting: null });
  const [throughput, setThroughput] = useState(1);
  const [annualVolume, setAnnualVolume] = useState(1000);
  const [savedWorkflows, setSavedWorkflows] = useState([]);

  const steps = [
    { key: 'extraction', label: 'Extraction', category: 'Extraction' },
    { key: 'libprep', label: 'Library Prep', category: 'Library Prep' },
    { key: 'automation', label: 'Automation', category: 'Automation' },
    { key: 'sequencing', label: 'Sequencing', category: 'Sequencing' },
    { key: 'analysis', label: 'Analysis', category: 'Analysis' },
    { key: 'reporting', label: 'Reporting', category: 'Reporting' },
  ];

  const getCompatibleProducts = (stepKey) => {
    const prevSteps = steps.slice(0, steps.findIndex(s => s.key === stepKey));
    const category = steps.find(s => s.key === stepKey)?.category;
    const categoryProducts = products.filter(p => p.category === category);

    if (stepKey === 'extraction') return categoryProducts;

    const prevStep = prevSteps[prevSteps.length - 1];
    const prevSelectedId = workflow[prevStep.key];
    if (!prevSelectedId) return categoryProducts;

    const compatibleIds = COMPATIBILITY
      .filter(c => c.source === prevSelectedId && c.level !== 'theoretical')
      .map(c => c.target);

    return categoryProducts.filter(p => compatibleIds.includes(p.id));
  };

  const getTotalCost = () => {
    let total = 0;
    Object.entries(workflow).forEach(([key, productId]) => {
      if (productId && COST_COMPONENTS[productId]) {
        total += COST_COMPONENTS[productId].total;
      }
    });
    return total;
  };

  const costPerSample = getTotalCost();
  const costPerRun = (costPerSample * throughput).toFixed(2);
  const costPerSampleAnnual = ((costPerSample * annualVolume) / annualVolume).toFixed(2);
  const totalAnnualCost = (costPerSample * annualVolume).toFixed(0);

  const vendorSet = new Set();
  Object.values(workflow).forEach(productId => {
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) vendorSet.add(product.vendor);
    }
  });
  const vendorLockInScore = ((6 - vendorSet.size) / 6 * 100).toFixed(0);

  const costBreakdown = {};
  Object.entries(workflow).forEach(([key, productId]) => {
    if (productId && COST_COMPONENTS[productId]) {
      costBreakdown[key] = COST_COMPONENTS[productId];
    }
  });

  const saveWorkflow = () => {
    const name = `Workflow-${savedWorkflows.length + 1}`;
    setSavedWorkflows([...savedWorkflows, { name, workflow, cost: costPerSample }]);
  };

  const costBreakdownData = Object.entries(costBreakdown).map(([step, costs]) => ({
    name: step.charAt(0).toUpperCase() + step.slice(1),
    Reagents: costs.reagents,
    'Instrument': costs.instrument_amortized,
    'Labor': costs.labor,
    'QC': costs.qc,
  }));

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">Total Cost of Ownership Calculator</h2>

        <div className="grid grid-cols-6 gap-4 mb-8">
          {steps.map(step => (
            <div key={step.key} className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase">{step.label}</label>
              <select
                value={workflow[step.key] || ''}
                onChange={(e) => setWorkflow({...workflow, [step.key]: e.target.value || null})}
                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-xs text-white"
              >
                <option value="">Select product</option>
                {getCompatibleProducts(step.key).map(p => (
                  <option key={p.id} value={p.id}>{p.name.substring(0, 20)}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Cost per Sample</div>
            <div className="text-2xl font-bold text-emerald-400">${costPerSample.toFixed(2)}</div>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Throughput ({throughput} samples)</div>
            <div className="text-2xl font-bold text-blue-400">${costPerRun}</div>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Annual Volume</div>
            <input type="number" value={annualVolume} onChange={(e) => setAnnualVolume(parseInt(e.target.value) || 1000)} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white" />
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Annual Cost</div>
            <div className="text-2xl font-bold text-purple-400">${totalAnnualCost}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Samples per Run</label>
            <select value={throughput} onChange={(e) => setThroughput(parseInt(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-sm text-white">
              <option value={1}>1 sample</option>
              <option value={8}>8 samples</option>
              <option value={24}>24 samples</option>
              <option value={96}>96 samples</option>
            </select>
          </div>
          <div className="bg-orange-900/20 border border-orange-700 rounded p-3">
            <div className="text-xs text-orange-400 font-semibold mb-1">Vendor Lock-In Risk</div>
            <div className="text-3xl font-bold text-orange-300">{vendorLockInScore}%</div>
            <div className="text-xs text-orange-300 mt-1">{vendorSet.size} of 6 steps sourced differently</div>
          </div>
          <button onClick={saveWorkflow} className="bg-blue-700 hover:bg-blue-600 rounded px-4 py-2 font-semibold text-sm">Save Workflow</button>
        </div>

        {costBreakdownData.length > 0 && (
          <div className="h-64 mb-8">
            <h3 className="text-sm font-semibold mb-2">Cost Breakdown by Step</h3>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={costBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151'}} />
                <Bar dataKey="Reagents" fill="#10b981" stackId="cost" />
                <Bar dataKey="Instrument" fill="#3b82f6" stackId="cost" />
                <Bar dataKey="Labor" fill="#f59e0b" stackId="cost" />
                <Bar dataKey="QC" fill="#8b5cf6" stackId="cost" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {savedWorkflows.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Saved Workflows ({savedWorkflows.length})</h3>
          <div className="grid grid-cols-3 gap-4">
            {savedWorkflows.map((w, i) => (
              <div key={i} className="bg-gray-900 rounded p-3 border border-gray-700">
                <div className="font-semibold text-sm mb-2">{w.name}</div>
                <div className="text-xs text-gray-400 mb-3">${w.cost.toFixed(2)} per sample</div>
                <button onClick={() => setWorkflow(w.workflow)} className="text-xs bg-blue-700 hover:bg-blue-600 rounded px-2 py-1">Load</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// INDICATION STRATEGY VIEW
// ============================================

const IndicationStrategyView = ({ products, indicationFilter }) => {
  const [selectedIndication, setSelectedIndication] = useState('solid_tumor');

  const indication = INDICATIONS.find(i => i.key === selectedIndication);
  const indicationProducts = products.filter(p => p.indications?.includes(selectedIndication));
  const indicationTAM = MARKET_SIZE.byIndication[selectedIndication] || 5000;

  const topVendorsInIndication = useMemo(() => {
    const vendorShare = {};
    indicationProducts.forEach(p => {
      vendorShare[p.vendor] = (vendorShare[p.vendor] || 0) + (p.share || 0);
    });
    return Object.entries(vendorShare).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([v, s]) => ({
      vendor: VENDORS.find(vnd => vnd.key === v)?.label || v,
      share: s,
    }));
  }, [indicationProducts]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Indication-Specific Strategy</h2>

        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Select Indication</label>
          <div className="grid grid-cols-4 gap-2">
            {INDICATIONS.map(ind => (
              <button
                key={ind.key}
                onClick={() => setSelectedIndication(ind.key)}
                className={`p-3 rounded text-sm font-semibold transition-colors ${
                  selectedIndication === ind.key
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {ind.icon} {ind.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900 rounded p-4">
            <div className="text-xs text-gray-500 mb-1">TAM for {indication?.label}</div>
            <div className="text-3xl font-bold text-emerald-400">${indicationTAM}M</div>
            <div className="text-xs text-gray-400 mt-2">
              NA: ${(indicationTAM * MARKET_SIZE.byRegion.na).toFixed(0)}M |
              WE: ${(indicationTAM * MARKET_SIZE.byRegion.we).toFixed(0)}M |
              HG: ${(indicationTAM * MARKET_SIZE.byRegion.hg).toFixed(0)}M
            </div>
          </div>
          <div className="bg-gray-900 rounded p-4">
            <div className="text-xs text-gray-500 mb-1">Top Vendors in {indication?.label}</div>
            {topVendorsInIndication.map((v, i) => (
              <div key={i} className="text-xs text-gray-300 mt-1">{v.vendor}: {v.share.toFixed(1)}%</div>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Products for {indication?.label}</h3>
        <div className="grid grid-cols-3 gap-4">
          {indicationProducts.slice(0, 9).map(p => (
            <div key={p.id} className="bg-gray-900 rounded p-3 border border-gray-700">
              <div className="font-semibold text-sm mb-1">{p.name}</div>
              <div className="text-xs text-gray-400 mb-2">{VENDORS.find(v => v.key === p.vendor)?.label}</div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Share:</span>
                <span className="font-bold text-emerald-400">{p.share}%</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Regulatory:</span>
                <span className="text-blue-400 text-[10px]">{p.regulatory}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SCENARIO VIEW
// ============================================

const ScenarioView = ({ products, indicationFilter }) => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shareAdjustment, setShareAdjustment] = useState(0);
  const [pricingAdjustment, setPricingAdjustment] = useState(0);

  const prebuiltScenarios = [
    { name: 'Element Disrupts', product: 'element-aviti', shareChange: 8, description: 'Element gains 8% sequencing share from Illumina' },
    { name: 'MGI US Entry', product: 'mgi-seq', shareChange: 6, description: 'MGI enters US market capturing 6% share' },
    { name: 'New FDA CDx', product: 'illumina-dragen', shareChange: 5, description: 'New CDx approval drives 5% DRAGEN adoption' },
  ];

  const applyScenario = (name, productId, change) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setScenarios([...scenarios, {
      id: Date.now(),
      name,
      productId,
      originalShare: product.share,
      newShare: product.share + change,
      change,
      timestamp: new Date().toLocaleString(),
    }]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Scenario Modeling & What-If Analysis</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {prebuiltScenarios.map((scenario, i) => (
            <button
              key={i}
              onClick={() => applyScenario(scenario.name, scenario.product, scenario.shareChange)}
              className="bg-gray-900 hover:bg-gray-700 rounded p-4 border border-gray-700 transition-colors text-left"
            >
              <div className="font-semibold text-sm mb-1">{scenario.name}</div>
              <div className="text-xs text-gray-400">{scenario.description}</div>
              <div className="text-lg font-bold text-blue-400 mt-2">+{scenario.shareChange}%</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-900 rounded p-4 border border-gray-700">
          <h3 className="font-semibold mb-3 text-sm">Custom Scenario Builder</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Product</label>
              <select
                value={selectedProduct || ''}
                onChange={(e) => setSelectedProduct(e.target.value || null)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-sm text-white"
              >
                <option value="">Select product</option>
                {products.slice(0, 20).map(p => (
                  <option key={p.id} value={p.id}>{p.name.substring(0, 25)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Share Change (%)</label>
              <input type="number" value={shareAdjustment} onChange={(e) => setShareAdjustment(parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-sm text-white" />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => selectedProduct && applyScenario(`Custom: ${products.find(p => p.id === selectedProduct)?.name}`, selectedProduct, shareAdjustment)}
                className="w-full bg-green-700 hover:bg-green-600 rounded px-4 py-2 font-semibold text-sm"
              >
                Apply Custom
              </button>
            </div>
          </div>
        </div>
      </div>

      {scenarios.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Applied Scenarios ({scenarios.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="bg-gray-900 rounded p-3 border border-gray-700 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{scenario.name}</div>
                    <div className="text-gray-400">{scenario.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400">Share Change</div>
                    <div className={`font-bold text-lg ${scenario.change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {scenario.change > 0 ? '+' : ''}{scenario.change}%
                    </div>
                    <div className="text-gray-500 text-[10px]">{scenario.originalShare}% → {scenario.newShare}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// INTEL SIGNALS VIEW
// ============================================

const IntelSignalsView = ({ products, indicationFilter }) => {
  const [filterType, setFilterType] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterImpact, setFilterImpact] = useState('');

  const filteredSignals = useMemo(() => {
    return INTEL_SIGNALS.filter(signal => {
      return (!filterType || signal.type === filterType) &&
             (!filterVendor || signal.vendor === filterVendor) &&
             (!filterImpact || signal.impact === filterImpact);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filterType, filterVendor, filterImpact]);

  const highImpactSignals = INTEL_SIGNALS.filter(s => s.impact === 'high').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  const signalsByType = useMemo(() => {
    const types = {};
    INTEL_SIGNALS.forEach(s => {
      types[s.type] = (types[s.type] || 0) + 1;
    });
    return Object.entries(types).map(([k, v]) => ({ name: k, value: v }));
  }, []);

  const signalsByVendor = useMemo(() => {
    const vendors = {};
    INTEL_SIGNALS.forEach(s => {
      vendors[s.vendor] = (vendors[s.vendor] || 0) + 1;
    });
    return Object.entries(vendors).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ name: VENDORS.find(vnd => vnd.key === k)?.label || k, value: v }));
  }, []);

  return (
    <div className="space-y-6">
      {highImpactSignals.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4">High-Impact Alerts</h2>
          <div className="grid grid-cols-3 gap-4">
            {highImpactSignals.map(signal => (
              <div key={signal.id} className="bg-red-950 rounded p-4 border border-red-700">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 bg-red-700 text-red-100 text-xs rounded font-semibold uppercase">{signal.type}</span>
                  <span className="text-xs text-red-400 font-semibold">{signal.date}</span>
                </div>
                <h3 className="font-bold text-sm text-white mb-2">{signal.title}</h3>
                <p className="text-xs text-gray-300 mb-3">{signal.summary}</p>
                <div className="text-xs text-gray-400">Source: {signal.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Intelligence Feed</h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-sm text-white">
              <option value="">All Types</option>
              <option value="regulatory">Regulatory</option>
              <option value="pricing">Pricing</option>
              <option value="partnership">Partnership</option>
              <option value="product_launch">Product Launch</option>
              <option value="market_entry">Market Entry</option>
              <option value="acquisition">Acquisition</option>
              <option value="clinical_data">Clinical Data</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Vendor</label>
            <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-sm text-white">
              <option value="">All Vendors</option>
              {[...new Set(INTEL_SIGNALS.map(s => s.vendor))].map(v => (
                <option key={v} value={v}>{VENDORS.find(vnd => vnd.key === v)?.label || v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Impact</label>
            <select value={filterImpact} onChange={(e) => setFilterImpact(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-2 text-sm text-white">
              <option value="">All Impacts</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Total Signals</div>
            <div className="text-2xl font-bold text-white">{filteredSignals.length}</div>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSignals.map(signal => (
            <div key={signal.id} className="bg-gray-900 rounded p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded font-semibold uppercase ${
                    signal.impact === 'high' ? 'bg-red-900 text-red-200' :
                    signal.impact === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-blue-900 text-blue-200'
                  }`}>{signal.impact}</span>
                  <span className="px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded">{signal.type}</span>
                </div>
                <span className="text-xs text-gray-500">{signal.date}</span>
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">{signal.title}</h3>
              <p className="text-xs text-gray-300 mb-2">{signal.summary}</p>
              <div className="text-xs text-gray-500">Source: {signal.source}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold mb-3">Signals by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={signalsByType} dataKey="value" nameKey="name" fill="#3b82f6">
                {signalsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'][index % 6]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #374151'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold mb-3">Signals by Vendor</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={signalsByVendor}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} tick={{fontSize: 11}} />
              <YAxis stroke="#9ca3af" />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [indicationFilter, setIndicationFilter] = useState([]);
  const [adjustments, setAdjustments] = useState({});

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
      case 'tco':
        return <TCOCalculatorView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'indication':
        return <IndicationStrategyView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'scenarios':
        return <ScenarioView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'signals':
        return <IntelSignalsView products={filteredProducts} indicationFilter={indicationFilter} />;
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
    <ScenarioContext.Provider value={{ adjustments, setAdjustments }}>
      <div className="flex min-h-screen bg-gray-950 text-white">
        <Sidebar activeView={activeView} setActiveView={setActiveView} indicationFilter={indicationFilter} />
        <main className="flex-1 p-8">
          <IndicationFilterBar indicationFilter={indicationFilter} setIndicationFilter={setIndicationFilter} />
          {renderView()}
        </main>
      </div>
    </ScenarioContext.Provider>
  );
}
