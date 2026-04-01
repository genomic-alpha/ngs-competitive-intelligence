import React, { useState, useMemo, useCallback, createContext, useContext } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, RadarChart, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarAngleAxis, PolarGrid, PieChart, Pie, Cell, Area, AreaChart, ComposedChart, ReferenceLine } from 'recharts';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, TrendingUp, TrendingDown, ArrowRight, Users, Package, Zap, Globe, DollarSign, FileText, Calendar, Download, Plus, Trash2, Edit3, Save, Upload, Copy, RefreshCw, Search, Filter, ChevronUp, X, Handshake, Shield, Heart, Clock, AlertTriangle, BarChart3, Activity } from 'lucide-react';

// ============================================
// SCENARIO CONTEXT
// ============================================

const ScenarioContext = createContext({ adjustments: {}, setAdjustments: () => {} });

// ============================================
// DATA CONTEXT
// ============================================

const DataContext = createContext(null);
const useData = () => useContext(DataContext);

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

const CATEGORIES = ['Extraction', 'Library Prep', 'Automation', 'Sequencing', 'Analysis', 'Reporting', 'Diagnostic Services'];
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

const DEFAULT_VENDORS = [
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
  { key: 'emedgene', label: 'Emedgene (Illumina Partner)', color: '#d8b4fe', strength: 'AI-driven rare disease interpretation, Illumina ecosystem', weakness: 'Rare disease focused, limited somatic', recentMove: 'Illumina platform partnership, expanded gene panels' },
];

const DEFAULT_PRODUCTS = [
  // EXTRACTION
  { id: 'qiagen-ffpe-ext', vendor: 'qiagen', name: 'QIAamp FFPE DNA', category: 'Extraction', tier: 'A', share: 10.1, pricing: 8, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:18,we:25,hg:17,od:22}, growth: "stable", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'qiagen-blood-ext', vendor: 'qiagen', name: 'QIAamp Blood', category: 'Extraction', tier: 'A', share: 8.1, pricing: 5, regulatory: 'RUO', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:17,we:18,hg:12,od:14}, growth: "stable", indications: ["liquid_biopsy","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'promega-ffpe-ext', vendor: 'promega', name: 'Promega FFPE DNA', category: 'Extraction', tier: 'B', share: 9.0, pricing: 9, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:4,hg:5,od:6}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'promega-blood-ext', vendor: 'promega', name: 'Promega Blood DNA', category: 'Extraction', tier: 'B', share: 6.5, pricing: 5, regulatory: 'RUO', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:5,we:3,hg:2,od:3}, growth: "growing", indications: ["liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'roche-magna-ext', vendor: 'roche', name: 'Roche MagnaP', category: 'Extraction', tier: 'A', share: 15.0, pricing: 7, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:7,we:13,hg:9,od:12}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'thermo-magmax-ext', vendor: 'thermo', name: 'Thermo MagMAX', category: 'Extraction', tier: 'A', share: 14.5, pricing: 6, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:13,we:9,hg:10,od:9}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'beckman-ampure-ext', vendor: 'beckman', name: 'Beckman Ampure', category: 'Extraction', tier: 'B', share: 7.0, pricing: 3, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:4,od:4}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'zymo-ffpe-ext', vendor: 'zymo', name: 'Zymo Quick-DNA/RNA FFPE Kit', category: 'Extraction', tier: 'B', share: 3.5, pricing: 7, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:2,od:2}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'zymo-cfdna-ext', vendor: 'zymo', name: 'Zymo Quick-cfDNA Serum & Plasma Kit', category: 'Extraction', tier: 'B', share: 2.8, pricing: 9, regulatory: 'RUO', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:4,we:2,hg:1,od:1}, growth: "growing", indications: ["liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'mn-nucleomag-ext', vendor: 'macherey_nagel', name: 'Macherey-Nagel NucleoMag DNA/RNA FFPE', category: 'Extraction', tier: 'B', share: 4.5, pricing: 6, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:9,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"estimated",source:"EU distributor data",date:"2026-Q1"}} },
  { id: 'omega-magbind-ext', vendor: 'omega', name: 'Omega Mag-Bind TotalPure NGS', category: 'Extraction', tier: 'C', share: 2.8, pricing: 2, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:1,hg:4,od:2}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'omega-cfdna-ext', vendor: 'omega', name: 'Omega Mag-Bind cfDNA Kit', category: 'Extraction', tier: 'C', share: 1.8, pricing: 8, regulatory: 'RUO', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:2,we:1,hg:2,od:1}, growth: "growing", indications: ["liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'qiagen-qiasymphony-ext', vendor: 'qiagen', name: 'QIAsymphony DSP DNA/RNA', category: 'Extraction', tier: 'A', share: 5.8, pricing: 10, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:10,we:13,hg:7,od:10}, growth: "stable", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },
  { id: 'promega-maxwell-ffpe', vendor: 'promega', name: 'Promega Maxwell RSC FFPE DNA/RNA', category: 'Extraction', tier: 'B', share: 5.2, pricing: 8, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna","rna"], regionalShare: {na:6,we:4,hg:3,od:4}, growth: "growing", indications: ["solid_tumor","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },
  { id: 'promega-maxwell-blood', vendor: 'promega', name: 'Promega Maxwell RSC Blood DNA', category: 'Extraction', tier: 'B', share: 3.4, pricing: 6, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood"], nucleicAcids: ["dna"], regionalShare: {na:4,we:2,hg:2,od:2}, growth: "growing", indications: ["hereditary_cancer","liquid_biopsy"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },

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
  { id: 'guardant360-cdx', vendor: 'guardant', name: 'Guardant360 CDx (Service/Panel)', category: 'Diagnostic Services', tier: 'A', share: 3.2, pricing: 5000, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:8,we:6,hg:4,od:5}, growth: "stable", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:20,na:25,we:14,hg:7,od:11}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA PMA P200010",date:"2026-Q1"}} },
  { id: 'foundation-one-cdx', vendor: 'foundation', name: 'FoundationOne CDx (Service/Panel)', category: 'Diagnostic Services', tier: 'A', share: 3.6, pricing: 3500, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:11,we:8,hg:5,od:7}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:18,na:23,we:13,hg:9,od:14}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA PMA P170019",date:"2026-Q1"}} },
  { id: 'foundation-liquid-cdx', vendor: 'foundation', name: 'FoundationOne Liquid CDx (Service/Panel)', category: 'Diagnostic Services', tier: 'B', share: 2.7, pricing: 3500, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:4,hg:2,od:4}, growth: "growing", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:13,na:16,we:9,hg:5,od:7}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA PMA P200016",date:"2026-Q1"}} },
  { id: 'tempus-xt', vendor: 'tempus', name: 'Tempus xT 595-Gene Panel (Service)', category: 'Diagnostic Services', tier: 'B', share: 2.7, pricing: 3200, regulatory: 'CLIA/CAP', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:4,hg:2,od:4}, growth: "growing", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:7,na:11,we:3,hg:2,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'caris-mi-profile', vendor: 'caris', name: 'Caris MI Profile WES/WTS (Service)', category: 'Diagnostic Services', tier: 'B', share: 2.3, pricing: 4500, regulatory: 'CLIA/CAP', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:4,hg:2,od:3}, growth: "growing", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:5,na:9,we:2,hg:1,od:3}}, confidence: {share:{level:"estimated",source:"DeciBio 2024 + validation",date:"2026-Q1"},pricing:{level:"verified",source:"Service model",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'mgi-cools-panels', vendor: 'mgi', name: 'MGI CoolMPS Library Prep Panels', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 30, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:0,we:1,hg:4,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","infectious_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'pillar-oncoreveal-lung', vendor: 'pillar', name: 'oncoReveal Dx Lung & Colon Cancer Assay', category: 'Library Prep', tier: 'C', share: 0.9, pricing: 190, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:2,na:2,we:1,hg:3,od:1}}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA database",date:"2026-Q1"}} },
  { id: 'illumina-tso500-ctdna', vendor: 'illumina', name: 'TruSight Oncology 500 ctDNA', category: 'Library Prep', tier: 'B', share: 1.8, pricing: 380, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:1,od:2}, growth: "growing", indications: ["liquid_biopsy","solid_tumor"], indicationShare: {liquid_biopsy:{global:7,na:9,we:7,hg:3,od:5}}, confidence: {share:{level:"estimated",source:"DeciBio + channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },
  { id: 'myriad-mychoice-cdx', vendor: 'myriad', name: 'Myriad myChoice CDx (HRD)', category: 'Diagnostic Services', tier: 'A', share: 2.7, pricing: 4200, regulatory: 'FDA PMA', region: 'global', sampleTypes: ["ffpe"], nucleicAcids: ["dna"], regionalShare: {na:7,we:4,hg:2,od:3}, growth: "stable", indications: ["solid_tumor"], indicationShare: {solid_tumor:{global:7,na:11,we:5,hg:3,od:4}}, confidence: {share:{level:"estimated",source:"DeciBio + public filings",date:"2026-Q1"},pricing:{level:"verified",source:"Service model pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA PMA P190014",date:"2026-Q1"}} },
  { id: '10x-chromium-sc', vendor: '10x', name: '10x Chromium Single Cell Gene Expression', category: 'Library Prep', tier: 'A', share: 2.3, pricing: 500, regulatory: 'RUO', region: 'global', sampleTypes: ["blood","tissue"], nucleicAcids: ["rna"], regionalShare: {na:5,we:5,hg:2,od:3}, growth: "stable", indications: ["solid_tumor","heme_malig","rare_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"10x public filings + DeciBio",date:"2026-Q1"},pricing:{level:"estimated",source:"Public pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'natera-signatera', vendor: 'natera', name: 'Natera Signatera MRD (Service)', category: 'Diagnostic Services', tier: 'A', share: 2.3, pricing: 3500, regulatory: 'CLIA/CAP', region: 'global', sampleTypes: ["blood","cfdna"], nucleicAcids: ["dna"], regionalShare: {na:6,we:2,hg:1,od:1}, growth: "growing", indications: ["solid_tumor","liquid_biopsy"], indicationShare: {liquid_biopsy:{global:5,na:9,we:3,hg:1,od:2},solid_tumor:{global:3,na:5,we:2,hg:1,od:1}}, confidence: {share:{level:"estimated",source:"Natera public filings + DeciBio",date:"2026-Q1"},pricing:{level:"verified",source:"Service model pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"CLIA/CAP certified",date:"2026-Q1"}} },

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
  { id: 'roche-axelios', vendor: 'roche', name: 'Roche Axelios 1 (SBX)', category: 'Sequencing', tier: 'C', share: 0, pricing: 150, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "pre-launch", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Pre-commercial, planned H2 2026 launch",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing - $150 genome",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — Element Biosciences
  { id: 'element-aviti', vendor: 'element', name: 'AVITI', category: 'Sequencing', tier: 'C', share: 2.5, pricing: 100, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'element-aviti24', vendor: 'element', name: 'AVITI24 5D Multiomic', category: 'Sequencing', tier: 'C', share: 1.5, pricing: 150, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — Ultima Genomics
  { id: 'ultima-ug100', vendor: 'ultima', name: 'Ultima UG 100', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 100, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"$80/genome bulk pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'ultima-ug200', vendor: 'ultima', name: 'Ultima UG 200', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 80, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:0,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // SEQUENCING — Long-Read Platforms
  { id: 'pacbio-revio', vendor: 'pacbio', name: 'PacBio Revio', category: 'Sequencing', tier: 'C', share: 2, pricing: 500, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig","pharmacogenomics","hla_typing"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'pacbio-vega', vendor: 'pacbio', name: 'PacBio Vega (Benchtop)', category: 'Sequencing', tier: 'C', share: 1.0, pricing: 250, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","pharmacogenomics","hla_typing"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'oxford-minion', vendor: 'oxford', name: 'Oxford Nanopore MinION', category: 'Sequencing', tier: 'C', share: 0.4, pricing: 500, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'oxford-promethion', vendor: 'oxford', name: 'Oxford Nanopore PromethION', category: 'Sequencing', tier: 'C', share: 0.4, pricing: 200, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio/Grand View + validation",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'oxford-promethion-plus', vendor: 'oxford', name: 'PromethION Plus', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 180, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","liquid_biopsy","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Launch pricing + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'oxford-gridion', vendor: 'oxford', name: 'Oxford Nanopore GridION', category: 'Sequencing', tier: 'C', share: 0.5, pricing: 150, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:2,hg:1,od:1}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease","infectious_disease"], indicationShare: {}, confidence: {share:{level:"estimated",source:"DeciBio + channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'oxford-p2i', vendor: 'oxford', name: 'Oxford Nanopore PromethION 2 Integrated', category: 'Sequencing', tier: 'C', share: 0.2, pricing: 170, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Early access pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'pacbio-onso', vendor: 'pacbio', name: 'PacBio Onso', category: 'Sequencing', tier: 'C', share: 0.5, pricing: 80, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Launch pricing estimates",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },

  // SEQUENCING — Singular Genomics
  { id: 'singular-g4x', vendor: 'singular', name: 'Singular G4X Spatial Sequencer', category: 'Sequencing', tier: 'C', share: 0.3, pricing: 300, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:0,od:0}, growth: "emerging", indications: ["solid_tumor","rare_disease"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"approximate",source:"Early adopter pricing",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },

  // ANALYSIS
  { id: 'illumina-basespace', vendor: 'illumina', name: 'Illumina BaseSpace', category: 'Analysis', tier: 'A', share: 20, pricing: 0, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:13,we:9,hg:5,od:8}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'sophia-ddm', vendor: 'sophia', name: 'Sophia DDM', category: 'Analysis', tier: 'B', share: 10, pricing: 45, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:3,hg:11,od:3}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","heme_malig"], indicationShare: {solid_tumor:{global:8,na:5,we:12,hg:7,od:7},hereditary_cancer:{global:5,na:3,we:9,hg:4,od:4},heme_malig:{global:7,na:4,we:11,hg:5,od:5}}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Channel intelligence",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED + validation",date:"2026-Q1"}} },
  { id: 'roche-seqexplorer', vendor: 'roche', name: 'Roche SeqExplorer', category: 'Analysis', tier: 'B', share: 8.7, pricing: 25, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:5,we:5,hg:3,od:4}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'dragen', vendor: 'illumina', name: 'DRAGEN', category: 'Analysis', tier: 'A', share: 14.7, pricing: 8, regulatory: 'CE-IVDR', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:9,we:7,hg:4,od:6}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"FDA database",date:"2026-Q1"}} },
  { id: 'thermo-torrent-suite', vendor: 'thermo', name: 'Torrent Suite', category: 'Analysis', tier: 'B', share: 6, pricing: 0, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:1,od:3}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'agilent-genomics-workbench', vendor: 'agilent', name: 'Genomics Workbench', category: 'Analysis', tier: 'B', share: 4.7, pricing: 15, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:1,od:2}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'strand-ngs', vendor: 'qiagen', name: 'Strand NGS', category: 'Analysis', tier: 'C', share: 2.7, pricing: 10, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:1,od:1}, growth: "emerging", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources + validation",date:"2026-Q1"},regulatory:{level:"verified",source:"Validated 2026-Q1",date:"2026-Q1"}} },
  { id: 'nvidia-parabricks', vendor: 'nvidia', name: 'NVIDIA Parabricks', category: 'Analysis', tier: 'B', share: 3.3, pricing: 3, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:4,we:3,hg:1,od:2}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"NVIDIA licensing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'broad-gatk', vendor: 'broad', name: 'GATK (Genome Analysis Toolkit)', category: 'Analysis', tier: 'A', share: 16.7, pricing: 0, regulatory: 'Open Source', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:11,we:9,hg:7,od:8}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"verified",source:"Open source",date:"2026-Q1"},regulatory:{level:"verified",source:"Broad Institute",date:"2026-Q1"}} },
  { id: 'sentieon-dnascope', vendor: 'sentieon', name: 'Sentieon DNAscope/TNscope', category: 'Analysis', tier: 'B', share: 2.7, pricing: 5, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:3,hg:1,od:2}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"estimated",source:"Commercial licensing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'qiagen-clc', vendor: 'qiagen', name: 'QIAGEN CLC Genomics Workbench', category: 'Analysis', tier: 'B', share: 5.3, pricing: 20, regulatory: 'CE-IVD', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:4,hg:3,od:3}, growth: "stable", indications: ["solid_tumor","hereditary_cancer","rare_disease","heme_malig","infectious_disease"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Public sources",date:"2026-Q1"},regulatory:{level:"verified",source:"EU EUDAMED",date:"2026-Q1"}} },
  { id: 'pacbio-smrt-link', vendor: 'pacbio', name: 'PacBio SMRT Link', category: 'Analysis', tier: 'C', share: 1.3, pricing: 0, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:2,we:1,hg:1,od:1}, growth: "growing", indications: ["rare_disease","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"verified",source:"Bundled with instrument",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'oxford-epi2me', vendor: 'oxford', name: 'Oxford Nanopore EPI2ME', category: 'Analysis', tier: 'C', share: 1.3, pricing: 0, regulatory: 'RUO', region: 'global', sampleTypes: ["ffpe","blood","tissue"], nucleicAcids: ["dna","rna"], regionalShare: {na:1,we:1,hg:1,od:1}, growth: "growing", indications: ["rare_disease","infectious_disease","hereditary_cancer"], indicationShare: {}, confidence: {share:{level:"approximate",source:"Channel intelligence",date:"2026-Q1"},pricing:{level:"verified",source:"Bundled with platform",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },
  { id: 'dnaxnexus-platform', vendor: 'dnaxnexus', name: 'DNAnexus Apollo Platform', category: 'Analysis', tier: 'B', share: 2.7, pricing: 15, regulatory: 'ISO 13485', region: 'global', sampleTypes: ["ffpe","blood","cfdna"], nucleicAcids: ["dna","rna"], regionalShare: {na:3,we:2,hg:1,od:1}, growth: "growing", indications: ["solid_tumor","hereditary_cancer","rare_disease","pharmacogenomics"], indicationShare: {}, confidence: {share:{level:"low",source:"Industry estimate - unverifiable at product level",date:"2026-Q1"},pricing:{level:"estimated",source:"Enterprise licensing",date:"2026-Q1"},regulatory:{level:"verified",source:"Vendor website",date:"2026-Q1"}} },

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

const DEFAULT_TIMELINE_EVENTS = [
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

const DEFAULT_COMPATIBILITY_LAYERS = [
  { key: 'ext_to_libprep', label: 'Extraction → Library Prep', source: 'Extraction', target: 'Library Prep' },
  { key: 'libprep_to_auto', label: 'Library Prep → Automation', source: 'Library Prep', target: 'Automation' },
  { key: 'libprep_to_seq', label: 'Library Prep → Sequencing', source: 'Library Prep', target: 'Sequencing' },
  { key: 'seq_to_analysis', label: 'Sequencing → Analysis', source: 'Sequencing', target: 'Analysis' },
  { key: 'analysis_to_report', label: 'Analysis → Reporting', source: 'Analysis', target: 'Reporting' },
];

const DEFAULT_COMPATIBILITY = [
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

const DEFAULT_HISTORICAL_SNAPSHOTS = [
  { quarter: '2024-Q4', data: { 'qiagen-ffpe-ext': { share: 14.8, pricing: 8 }, 'qiagen-blood-ext': { share: 12.0, pricing: 5 }, 'roche-magna-ext': { share: 13.2, pricing: 7 }, 'thermo-magmax-ext': { share: 12.5, pricing: 6 }, 'illumina-dna-prep': { share: 18.3, pricing: 42 }, 'illumina-tso500': { share: 8.5, pricing: 78 }, 'agilent-sureselect': { share: 14.2, pricing: 65 }, 'twist-panels': { share: 5.8, pricing: 75 }, 'kapa-hyperprep': { share: 11.2, pricing: 52 }, 'idt-xgen': { share: 6.5, pricing: 68 }, 'neb-ultraii': { share: 4.2, pricing: 55 }, 'oncomine-dx': { share: 6.8, pricing: 82 }, 'miseq': { share: 16.5, pricing: 350 }, 'nextseq': { share: 14.2, pricing: 420 }, 'novaseq': { share: 12.8, pricing: 850 }, 'ion-s5': { share: 8.5, pricing: 280 }, 'mgi-seq': { share: 3.2, pricing: 120 }, 'element-aviti': { share: 0.8, pricing: 85 }, 'pacbio-revio': { share: 2.1, pricing: 350 }, 'oxford-minion': { share: 1.5, pricing: 80 }, 'dragen': { share: 11.5, pricing: 0 }, 'sophia-ddm': { share: 7.2, pricing: 95 }, 'qci-interpret': { share: 9.8, pricing: 48 }, 'velsera-cg': { share: 3.1, pricing: 0 }, 'illumina-basespace': { share: 16.2, pricing: 0 }, 'archer-fusionplex': { share: 2.4, pricing: 89 }, 'hamilton-ngs': { share: 8.9, pricing: 280 }, 'tecan-fluent': { share: 4.2, pricing: 225 } } },
  { quarter: '2025-Q1', data: { 'qiagen-ffpe-ext': { share: 14.9, pricing: 8 }, 'qiagen-blood-ext': { share: 12.1, pricing: 5 }, 'roche-magna-ext': { share: 13.4, pricing: 7 }, 'thermo-magmax-ext': { share: 12.6, pricing: 6 }, 'illumina-dna-prep': { share: 18.0, pricing: 42 }, 'illumina-tso500': { share: 8.3, pricing: 78 }, 'agilent-sureselect': { share: 14.0, pricing: 65 }, 'twist-panels': { share: 6.1, pricing: 75 }, 'kapa-hyperprep': { share: 11.0, pricing: 52 }, 'idt-xgen': { share: 6.7, pricing: 68 }, 'neb-ultraii': { share: 4.4, pricing: 55 }, 'oncomine-dx': { share: 6.9, pricing: 82 }, 'miseq': { share: 16.2, pricing: 350 }, 'nextseq': { share: 13.9, pricing: 420 }, 'novaseq': { share: 12.5, pricing: 850 }, 'ion-s5': { share: 8.3, pricing: 280 }, 'mgi-seq': { share: 3.8, pricing: 120 }, 'element-aviti': { share: 1.5, pricing: 85 }, 'pacbio-revio': { share: 2.3, pricing: 350 }, 'oxford-minion': { share: 1.8, pricing: 80 }, 'dragen': { share: 12.0, pricing: 0 }, 'sophia-ddm': { share: 7.4, pricing: 95 }, 'qci-interpret': { share: 10.0, pricing: 48 }, 'velsera-cg': { share: 3.3, pricing: 0 }, 'illumina-basespace': { share: 16.4, pricing: 0 }, 'archer-fusionplex': { share: 2.6, pricing: 89 }, 'hamilton-ngs': { share: 9.1, pricing: 280 }, 'tecan-fluent': { share: 4.4, pricing: 225 } } },
  { quarter: '2025-Q2', data: { 'qiagen-ffpe-ext': { share: 15.0, pricing: 8 }, 'qiagen-blood-ext': { share: 12.2, pricing: 5 }, 'roche-magna-ext': { share: 13.5, pricing: 7 }, 'thermo-magmax-ext': { share: 12.7, pricing: 6 }, 'illumina-dna-prep': { share: 17.8, pricing: 42 }, 'illumina-tso500': { share: 8.1, pricing: 78 }, 'agilent-sureselect': { share: 13.9, pricing: 65 }, 'twist-panels': { share: 6.3, pricing: 75 }, 'kapa-hyperprep': { share: 10.9, pricing: 52 }, 'idt-xgen': { share: 6.8, pricing: 68 }, 'neb-ultraii': { share: 4.5, pricing: 55 }, 'oncomine-dx': { share: 7.0, pricing: 82 }, 'miseq': { share: 15.9, pricing: 350 }, 'nextseq': { share: 13.6, pricing: 420 }, 'novaseq': { share: 12.2, pricing: 850 }, 'ion-s5': { share: 8.1, pricing: 280 }, 'mgi-seq': { share: 4.4, pricing: 120 }, 'element-aviti': { share: 2.2, pricing: 85 }, 'pacbio-revio': { share: 2.5, pricing: 350 }, 'oxford-minion': { share: 2.1, pricing: 80 }, 'dragen': { share: 12.4, pricing: 0 }, 'sophia-ddm': { share: 7.6, pricing: 95 }, 'qci-interpret': { share: 10.2, pricing: 48 }, 'velsera-cg': { share: 3.5, pricing: 0 }, 'illumina-basespace': { share: 16.5, pricing: 0 }, 'archer-fusionplex': { share: 2.8, pricing: 89 }, 'hamilton-ngs': { share: 9.2, pricing: 280 }, 'tecan-fluent': { share: 4.6, pricing: 225 } } },
  { quarter: '2025-Q3', data: { 'qiagen-ffpe-ext': { share: 15.1, pricing: 8 }, 'qiagen-blood-ext': { share: 12.2, pricing: 5 }, 'roche-magna-ext': { share: 13.6, pricing: 7 }, 'thermo-magmax-ext': { share: 12.8, pricing: 6 }, 'illumina-dna-prep': { share: 17.5, pricing: 42 }, 'illumina-tso500': { share: 8.0, pricing: 78 }, 'agilent-sureselect': { share: 13.8, pricing: 65 }, 'twist-panels': { share: 6.5, pricing: 75 }, 'kapa-hyperprep': { share: 10.8, pricing: 52 }, 'idt-xgen': { share: 6.9, pricing: 68 }, 'neb-ultraii': { share: 4.6, pricing: 55 }, 'oncomine-dx': { share: 7.1, pricing: 82 }, 'miseq': { share: 15.6, pricing: 350 }, 'nextseq': { share: 13.4, pricing: 420 }, 'novaseq': { share: 11.9, pricing: 850 }, 'ion-s5': { share: 7.9, pricing: 280 }, 'mgi-seq': { share: 5.1, pricing: 120 }, 'element-aviti': { share: 2.9, pricing: 85 }, 'pacbio-revio': { share: 2.7, pricing: 350 }, 'oxford-minion': { share: 2.3, pricing: 80 }, 'dragen': { share: 12.7, pricing: 0 }, 'sophia-ddm': { share: 7.8, pricing: 95 }, 'qci-interpret': { share: 10.4, pricing: 48 }, 'velsera-cg': { share: 3.7, pricing: 0 }, 'illumina-basespace': { share: 16.6, pricing: 0 }, 'archer-fusionplex': { share: 2.9, pricing: 89 }, 'hamilton-ngs': { share: 9.3, pricing: 280 }, 'tecan-fluent': { share: 4.7, pricing: 225 } } },
  { quarter: '2025-Q4', data: { 'qiagen-ffpe-ext': { share: 15.1, pricing: 8 }, 'qiagen-blood-ext': { share: 12.2, pricing: 5 }, 'roche-magna-ext': { share: 13.5, pricing: 7 }, 'thermo-magmax-ext': { share: 12.8, pricing: 6 }, 'illumina-dna-prep': { share: 17.2, pricing: 42 }, 'illumina-tso500': { share: 7.9, pricing: 78 }, 'agilent-sureselect': { share: 13.7, pricing: 65 }, 'twist-panels': { share: 6.6, pricing: 75 }, 'kapa-hyperprep': { share: 10.7, pricing: 52 }, 'idt-xgen': { share: 7.0, pricing: 68 }, 'neb-ultraii': { share: 4.7, pricing: 55 }, 'oncomine-dx': { share: 7.1, pricing: 82 }, 'miseq': { share: 15.4, pricing: 350 }, 'nextseq': { share: 13.2, pricing: 420 }, 'novaseq': { share: 11.7, pricing: 850 }, 'ion-s5': { share: 7.7, pricing: 280 }, 'mgi-seq': { share: 5.6, pricing: 120 }, 'element-aviti': { share: 3.4, pricing: 85 }, 'pacbio-revio': { share: 2.8, pricing: 350 }, 'oxford-minion': { share: 2.4, pricing: 80 }, 'dragen': { share: 13.0, pricing: 0 }, 'sophia-ddm': { share: 7.9, pricing: 95 }, 'qci-interpret': { share: 10.5, pricing: 48 }, 'velsera-cg': { share: 3.8, pricing: 0 }, 'illumina-basespace': { share: 16.7, pricing: 0 }, 'archer-fusionplex': { share: 3.0, pricing: 89 }, 'hamilton-ngs': { share: 9.4, pricing: 280 }, 'tecan-fluent': { share: 4.8, pricing: 225 } } },
  { quarter: '2026-Q1', data: { 'qiagen-ffpe-ext': { share: 15.1, pricing: 8 }, 'qiagen-blood-ext': { share: 12.2, pricing: 5 }, 'roche-magna-ext': { share: 13.7, pricing: 7 }, 'thermo-magmax-ext': { share: 12.9, pricing: 6 }, 'illumina-dna-prep': { share: 17.0, pricing: 42 }, 'illumina-tso500': { share: 7.8, pricing: 78 }, 'agilent-sureselect': { share: 13.6, pricing: 65 }, 'twist-panels': { share: 6.8, pricing: 75 }, 'kapa-hyperprep': { share: 10.6, pricing: 52 }, 'idt-xgen': { share: 7.1, pricing: 68 }, 'neb-ultraii': { share: 4.8, pricing: 55 }, 'oncomine-dx': { share: 7.2, pricing: 82 }, 'miseq': { share: 15.2, pricing: 350 }, 'nextseq': { share: 13.1, pricing: 420 }, 'novaseq': { share: 11.6, pricing: 850 }, 'ion-s5': { share: 7.6, pricing: 280 }, 'mgi-seq': { share: 6.1, pricing: 120 }, 'element-aviti': { share: 4.0, pricing: 85 }, 'pacbio-revio': { share: 2.9, pricing: 350 }, 'oxford-minion': { share: 2.5, pricing: 80 }, 'dragen': { share: 13.2, pricing: 0 }, 'sophia-ddm': { share: 8.1, pricing: 95 }, 'qci-interpret': { share: 10.7, pricing: 48 }, 'velsera-cg': { share: 3.9, pricing: 0 }, 'illumina-basespace': { share: 16.8, pricing: 0 }, 'archer-fusionplex': { share: 3.1, pricing: 89 }, 'hamilton-ngs': { share: 9.5, pricing: 280 }, 'tecan-fluent': { share: 4.9, pricing: 225 } } },
];

const DEFAULT_MARKET_SIZE = {
  byCategory: { 'Extraction': 1300, 'Library Prep': 1600, 'Automation': 900, 'Sequencing': 6200, 'Analysis': 2300, 'Reporting': 1000, 'Diagnostic Services': 5200 },
  byIndication: { solid_tumor: 3800, liquid_biopsy: 2800, hereditary_cancer: 1500, heme_malig: 1200, rare_disease: 1300, pharmacogenomics: 650, hla_typing: 450, infectious_disease: 1800 },
  byRegion: { na: 0.46, we: 0.27, hg: 0.20, od: 0.07 },
  totalNGS: 13500,
  cagr: 0.142,
  year: 2026,
  futureCategories: { 'Proteomics': 2800, 'Spatial Biology': 1200, 'Long-Read Sequencing': 1800, 'Epigenomics': 600, 'Single-Cell Multi-omics': 900 },
};

const DEFAULT_INTEL_SIGNALS = [
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

const DEFAULT_COST_COMPONENTS = {
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

// ============================================
// FINANCIAL DATA (SEC FILINGS)
// ============================================

const DEFAULT_FINANCIALS = {
  illumina: {
    ticker: 'ILMN', vendorKey: 'illumina', lastFY: 'FY2024', revenue: 4300, segmentRevenue: null,
    revenueGrowth: -0.02, grossMargin: 0.683, opMargin: 0.213, rdSpend: 1169, rdPct: 0.271,
    epsNonGaap: 4.16, cash: 1220, totalDebt: 2622, marketCap: 22000,
    guidanceRevenue: [4280, 4400], guidanceEps: [4.20, 4.30],
    keyCommentary: 'Slowing research funding; GRAIL spinoff completed June 2024. Greater China facing geopolitical headwinds. Tariff impact ~$85M.',
    filingSource: 'SEC 10-K FY2024, filed Feb 12, 2025', lastUpdated: '2025-02-12', profitable: true,
    quarterly: [
      { quarter: 'Q1 2024', revenue: 1060 }, { quarter: 'Q2 2024', revenue: 1090 },
      { quarter: 'Q3 2024', revenue: 1080 }, { quarter: 'Q4 2024', revenue: 1100 },
      { quarter: 'Q1 2025', revenue: 1040 },
    ],
    balanceSheet: { totalAssets: 6303, totalLiabilities: 3930, equity: 2373 },
    installedBase: { total: 22000, note: 'NovaSeq X: 630 units; 56% clinical customers' },
  },
  roche: {
    ticker: 'RHHBY', vendorKey: 'roche', lastFY: 'FY2024', revenue: 68700, segmentRevenue: 16200,
    revenueGrowth: 0.07, grossMargin: 0.65, opMargin: 0.344, rdSpend: 9300, rdPct: 0.153,
    epsNonGaap: 18.80, cash: 17600, totalDebt: 50400, marketCap: 230000,
    guidanceRevenue: null, guidanceEps: null,
    keyCommentary: 'Diagnostics division +4% CER. SBX sequencer launched Feb 2025. China healthcare pricing reforms headwind. Mid-single-digit CER growth guided.',
    filingSource: 'Roche Annual Report 2024', lastUpdated: '2025-01-30', profitable: true,
    quarterly: [
      { quarter: 'H1 2024', revenue: 34100 }, { quarter: 'H2 2024', revenue: 34600 },
    ],
    balanceSheet: { totalAssets: 114000, totalLiabilities: 71200, equity: 42800 },
    installedBase: null,
  },
  thermo: {
    ticker: 'TMO', vendorKey: 'thermo', lastFY: 'FY2024', revenue: 42880, segmentRevenue: 9630,
    revenueGrowth: 0.0, grossMargin: 0.413, opMargin: 0.179, rdSpend: 1390, rdPct: 0.032,
    epsNonGaap: 21.86, cash: 8700, totalDebt: 35000, marketCap: 190000,
    guidanceRevenue: [46300, 47200], guidanceEps: [24.22, 24.80],
    keyCommentary: 'Life Sciences Solutions segment $9.6B. FY2025 total $44.6B (+4%). Genexus and Ion Torrent platforms. Genetic Sciences growth.',
    filingSource: 'SEC 10-K FY2024', lastUpdated: '2025-02-05', profitable: true,
    quarterly: [
      { quarter: 'Q1 2024', revenue: 10470 }, { quarter: 'Q2 2024', revenue: 10540 },
      { quarter: 'Q3 2024', revenue: 10600 }, { quarter: 'Q4 2024', revenue: 11400 },
    ],
    balanceSheet: { totalAssets: 97320, totalLiabilities: 47650, equity: 49670 },
    installedBase: null,
  },
  qiagen: {
    ticker: 'QGEN', vendorKey: 'qiagen', lastFY: 'FY2024', revenue: 1978, segmentRevenue: null,
    revenueGrowth: 0.007, grossMargin: 0.489, opMargin: 0.049, rdSpend: 193, rdPct: 0.098,
    epsNonGaap: 2.19, cash: 664, totalDebt: 1300, marketCap: 10500,
    guidanceRevenue: [2060, 2080], guidanceEps: [2.35, 2.40],
    keyCommentary: 'QIAstat-Dx syndromic testing +41% CER. QuantiFERON TB +11%. Parse Biosciences acquisition for single-cell ($225M). 4-5% CER growth guided.',
    filingSource: 'QIAGEN FY2024 Annual Results', lastUpdated: '2025-02-05', profitable: true,
    quarterly: [
      { quarter: 'Q1 2024', revenue: 459 }, { quarter: 'Q2 2024', revenue: 496 },
      { quarter: 'Q3 2024', revenue: 502 }, { quarter: 'Q4 2024', revenue: 521 },
    ],
    balanceSheet: { totalAssets: 6800, totalLiabilities: 3200, equity: 3600 },
    installedBase: null,
  },
  agilent: {
    ticker: 'A', vendorKey: 'agilent', lastFY: 'FY2025', revenue: 6950, segmentRevenue: 2800,
    revenueGrowth: 0.067, grossMargin: 0.547, opMargin: 0.213, rdSpend: 455, rdPct: 0.065,
    epsNonGaap: 5.59, cash: 1800, totalDebt: 3000, marketCap: 38000,
    guidanceRevenue: [7300, 7500], guidanceEps: [5.86, 6.00],
    keyCommentary: 'LDG segment +15% Q4. SureSelect NGS target enrichment growing. BIOVECTRA acquisition ($925M). Avida Biomed NGS enrichment acquired.',
    filingSource: 'Agilent FY2025 Q4 Results', lastUpdated: '2025-11-24', profitable: true,
    quarterly: [
      { quarter: 'Q1 FY25', revenue: 1680 }, { quarter: 'Q2 FY25', revenue: 1700 },
      { quarter: 'Q3 FY25', revenue: 1710 }, { quarter: 'Q4 FY25', revenue: 1860 },
    ],
    balanceSheet: { totalAssets: 14500, totalLiabilities: 7200, equity: 7300 },
    installedBase: null,
  },
  twist: {
    ticker: 'TWST', vendorKey: 'twist', lastFY: 'FY2024', revenue: 313, segmentRevenue: null,
    revenueGrowth: 0.28, grossMargin: 0.426, opMargin: -0.35, rdSpend: 91, rdPct: 0.29,
    epsNonGaap: null, cash: 350, totalDebt: 100, marketCap: 3200,
    guidanceRevenue: [372, 379], guidanceEps: null,
    keyCommentary: 'NGS revenue +25% YoY. Exome 2.0 and panel products growing. FY2025 guidance 19-21% growth. Gross margin expanding from 37% to 43%.',
    filingSource: 'Twist Bioscience FY2024 (ended Sept 30, 2024)', lastUpdated: '2024-11-15', profitable: false,
    quarterly: [
      { quarter: 'Q1 FY24', revenue: 72 }, { quarter: 'Q2 FY24', revenue: 75 },
      { quarter: 'Q3 FY24', revenue: 82 }, { quarter: 'Q4 FY24', revenue: 85 },
    ],
    balanceSheet: { totalAssets: 1200, totalLiabilities: 450, equity: 750 },
    installedBase: null,
  },
  pacbio: {
    ticker: 'PACB', vendorKey: 'pacbio', lastFY: 'FY2024', revenue: 154, segmentRevenue: null,
    revenueGrowth: -0.23, grossMargin: 0.31, opMargin: -0.85, rdSpend: 140, rdPct: 0.91,
    epsNonGaap: null, cash: 390, totalDebt: 645, marketCap: 500,
    guidanceRevenue: null, guidanceEps: null,
    keyCommentary: 'Revio installed base ~200 systems. 45% first-time PacBio users. Revenue declined 23% YoY. Debt restructuring completed. Gross margin improving.',
    filingSource: 'PacBio FY2024 Results', lastUpdated: '2025-02-13', profitable: false,
    quarterly: [
      { quarter: 'Q1 2024', revenue: 39 }, { quarter: 'Q2 2024', revenue: 36 },
      { quarter: 'Q3 2024', revenue: 40 }, { quarter: 'Q4 2024', revenue: 39 },
    ],
    balanceSheet: { totalAssets: 1400, totalLiabilities: 900, equity: 500 },
    installedBase: { total: 200, note: 'Revio systems; 97 shipped in 2024' },
  },
  oxford: {
    ticker: 'ONT.L', vendorKey: 'oxford', lastFY: 'FY2024', revenue: 228, segmentRevenue: null,
    revenueGrowth: 0.08, grossMargin: 0.573, opMargin: -0.60, rdSpend: 120, rdPct: 0.53,
    epsNonGaap: null, cash: 505, totalDebt: 50, marketCap: 2800,
    guidanceRevenue: null, guidanceEps: null,
    keyCommentary: 'H2 2024 underlying growth +34%. 1,900+ P2 devices in field. EBITDA breakeven targeted FY27. GridION Q for clinical customers launched.',
    filingSource: 'ONT FY2024 Annual Results (London Stock Exchange)', lastUpdated: '2025-03-06', profitable: false,
    quarterly: [
      { quarter: 'H1 2024', revenue: 105 }, { quarter: 'H2 2024', revenue: 123 },
    ],
    balanceSheet: { totalAssets: 850, totalLiabilities: 300, equity: 550 },
    installedBase: { total: 1900, note: 'PromethION 2 devices; 14,000+ peer-reviewed publications' },
  },
  '10x': {
    ticker: 'TXG', vendorKey: '10x', lastFY: 'FY2024', revenue: 611, segmentRevenue: null,
    revenueGrowth: -0.01, grossMargin: 0.68, opMargin: -0.443, rdSpend: 265, rdPct: 0.43,
    epsNonGaap: null, cash: 393, totalDebt: 50, marketCap: 2100,
    guidanceRevenue: [610, 630], guidanceEps: null,
    keyCommentary: 'Flat to +3% growth guided. NIH funding 20-25% of revenue; mid-single-digit decline expected. Chromium X and Xenium spatial platforms.',
    filingSource: '10x Genomics FY2024 Results', lastUpdated: '2025-02-12', profitable: false,
    quarterly: [
      { quarter: 'Q1 2024', revenue: 141 }, { quarter: 'Q2 2024', revenue: 153 },
      { quarter: 'Q3 2024', revenue: 152 }, { quarter: 'Q4 2024', revenue: 165 },
    ],
    balanceSheet: { totalAssets: 900, totalLiabilities: 350, equity: 550 },
    installedBase: null,
  },
  guardant: {
    ticker: 'GH', vendorKey: 'guardant', lastFY: 'FY2024', revenue: 727, segmentRevenue: null,
    revenueGrowth: 0.31, grossMargin: 0.62, opMargin: -0.60, rdSpend: 250, rdPct: 0.34,
    epsNonGaap: null, cash: 526, totalDebt: 1100, marketCap: 5500,
    guidanceRevenue: [850, 860], guidanceEps: null,
    keyCommentary: 'Precision oncology +30-35% YoY. Q4 clinical tests 57,300 (+24%). Shield screening platform ramping. Non-screening FCF breakeven Q4 2025.',
    filingSource: 'Guardant Health FY2024 Results', lastUpdated: '2025-02-20', profitable: false,
    quarterly: [
      { quarter: 'Q1 2024', revenue: 160 }, { quarter: 'Q2 2024', revenue: 174 },
      { quarter: 'Q3 2024', revenue: 192 }, { quarter: 'Q4 2024', revenue: 202 },
    ],
    balanceSheet: { totalAssets: 2800, totalLiabilities: 2400, equity: -140 },
    installedBase: null,
  },
  natera: {
    ticker: 'NTRA', vendorKey: 'natera', lastFY: 'FY2025', revenue: 2306, segmentRevenue: null,
    revenueGrowth: 0.36, grossMargin: 0.647, opMargin: -0.134, rdSpend: 624, rdPct: 0.27,
    epsNonGaap: null, cash: 1076, totalDebt: 0, marketCap: 28000,
    guidanceRevenue: [2620, 2700], guidanceEps: null,
    keyCommentary: 'Signatera MRD volumes +56% Q4. Total 3.53M tests in FY2025. Oncology tests 800K (+52%). Zero debt. Aggressive R&D investment ($750-850M guided 2026).',
    filingSource: 'Natera FY2025 Q4 Results', lastUpdated: '2026-02-20', profitable: false,
    quarterly: [
      { quarter: 'Q1 2025', revenue: 505 }, { quarter: 'Q2 2025', revenue: 555 },
      { quarter: 'Q3 2025', revenue: 580 }, { quarter: 'Q4 2025', revenue: 666 },
    ],
    balanceSheet: { totalAssets: 3500, totalLiabilities: 1200, equity: 2300 },
    installedBase: null,
  },
  myriad: {
    ticker: 'MYGN', vendorKey: 'myriad', lastFY: 'FY2025', revenue: 825, segmentRevenue: null,
    revenueGrowth: -0.02, grossMargin: 0.70, opMargin: -0.02, rdSpend: 85, rdPct: 0.10,
    epsNonGaap: 0.04, cash: 150, totalDebt: 158, marketCap: 430,
    guidanceRevenue: [860, 880], guidanceEps: null,
    keyCommentary: 'Hereditary cancer volume +10%. GeneSight pharmacogenomics +9%. myChoice CDx expanding tumor types. Near breakeven profitability.',
    filingSource: 'Myriad FY2025 Q4 Results', lastUpdated: '2026-02-23', profitable: false,
    quarterly: [
      { quarter: 'Q1 2025', revenue: 200 }, { quarter: 'Q2 2025', revenue: 207 },
      { quarter: 'Q3 2025', revenue: 208 }, { quarter: 'Q4 2025', revenue: 210 },
    ],
    balanceSheet: { totalAssets: 2100, totalLiabilities: 900, equity: 1200 },
    installedBase: null,
  },
  tempus: {
    ticker: 'TEM', vendorKey: 'tempus', lastFY: 'FY2025', revenue: 1270, segmentRevenue: 955,
    revenueGrowth: 0.80, grossMargin: 0.636, opMargin: -0.25, rdSpend: 200, rdPct: 0.16,
    epsNonGaap: null, cash: 764, totalDebt: 1250, marketCap: 12000,
    guidanceRevenue: null, guidanceEps: null,
    keyCommentary: 'IPO June 2024. Diagnostics $955M. 217K clinical tests Q3 (+33%). Adjusted EBITDA slightly positive FY2025. Ambry acquisition boosted hereditary.',
    filingSource: 'Tempus AI FY2025 Preliminary Results', lastUpdated: '2026-01-10', profitable: false,
    quarterly: [
      { quarter: 'Q1 2025', revenue: 280 }, { quarter: 'Q2 2025', revenue: 310 },
      { quarter: 'Q3 2025', revenue: 334 }, { quarter: 'Q4 2025', revenue: 346 },
    ],
    balanceSheet: { totalAssets: 4500, totalLiabilities: 2800, equity: 1700 },
    installedBase: null,
  },
  sophia: {
    ticker: 'SOPH', vendorKey: 'sophia', lastFY: 'FY2025', revenue: 77, segmentRevenue: null,
    revenueGrowth: 0.19, grossMargin: 0.674, opMargin: -0.80, rdSpend: 35, rdPct: 0.45,
    epsNonGaap: null, cash: 82, totalDebt: 63, marketCap: 306,
    guidanceRevenue: [92, 94], guidanceEps: null,
    keyCommentary: 'Cloud genomics platform +19% growth. Adjusted EBITDA loss $41.5M. Gross margin expanding to 74% adjusted. Early-stage scaling.',
    filingSource: 'SOPHiA Genetics FY2025 Results', lastUpdated: '2026-02-28', profitable: false,
    quarterly: [
      { quarter: 'Q1 2025', revenue: 17 }, { quarter: 'Q2 2025', revenue: 19 },
      { quarter: 'Q3 2025', revenue: 19 }, { quarter: 'Q4 2025', revenue: 22 },
    ],
    balanceSheet: { totalAssets: 350, totalLiabilities: 150, equity: 200 },
    installedBase: null,
  },
  revvity: {
    ticker: 'RVTY', vendorKey: 'revvity', lastFY: 'FY2025', revenue: 2856, segmentRevenue: 1400,
    revenueGrowth: 0.037, grossMargin: 0.533, opMargin: 0.149, rdSpend: 200, rdPct: 0.07,
    epsNonGaap: 5.20, cash: 920, totalDebt: 2600, marketCap: 12050,
    guidanceRevenue: [2960, 2990], guidanceEps: [5.35, 5.45],
    keyCommentary: 'Life Sciences segment organic growth 2-3%. IDT genomics consumables soft. NGS products at IDT showing growth. Abcam recombinant proteins strong.',
    filingSource: 'Revvity FY2025 Q4 Results', lastUpdated: '2026-01-30', profitable: true,
    quarterly: [
      { quarter: 'Q1 2025', revenue: 690 }, { quarter: 'Q2 2025', revenue: 700 },
      { quarter: 'Q3 2025', revenue: 710 }, { quarter: 'Q4 2025', revenue: 756 },
    ],
    balanceSheet: { totalAssets: 12200, totalLiabilities: 6500, equity: 5700 },
    installedBase: null,
  },
  danaher: {
    ticker: 'DHR', vendorKey: 'danaher', lastFY: 'FY2025', revenue: 24600, segmentRevenue: 7200,
    revenueGrowth: 0.03, grossMargin: 0.591, opMargin: 0.282, rdSpend: 1800, rdPct: 0.073,
    epsNonGaap: 8.92, cash: 4620, totalDebt: 17000, marketCap: 150000,
    guidanceRevenue: null, guidanceEps: null,
    keyCommentary: 'Parent of Beckman Coulter + IDT. Life Sciences segment +0.5% core. IDT genomics consumables materially down (lost 2 major customers). NGS products growing.',
    filingSource: 'Danaher FY2025 Q4 Results', lastUpdated: '2026-01-28', profitable: true,
    quarterly: [
      { quarter: 'Q1 2025', revenue: 5900 }, { quarter: 'Q2 2025', revenue: 6100 },
      { quarter: 'Q3 2025', revenue: 6200 }, { quarter: 'Q4 2025', revenue: 6400 },
    ],
    balanceSheet: { totalAssets: 78000, totalLiabilities: 38000, equity: 40000 },
    installedBase: null,
  },
};

const DEFAULT_PARTNERS = [
  {
    id: 'partner-illumina',
    vendorKey: 'illumina',
    status: 'active',
    tier: 'strategic',
    contractStart: '2024-06-01',
    contractEnd: '2026-05-31',
    contractValue: 450000,
    pricingTier: 'enterprise',
    discountPct: 22,
    paymentTerms: 'Net 45',
    autoRenew: true,
    primaryContact: 'Sarah Chen',
    primaryContactRole: 'Enterprise Account Manager',
    primaryContactEmail: 'schen@illumina.com',
    integrationStatus: 'validated',
    validatedProducts: ['illumina-novaseq', 'illumina-nextseq', 'illumina-dragen'],
    integrationNotes: 'Full DRAGEN pipeline validated for solid tumor and liquid biopsy workflows',
    technicalContact: 'Mike Rivera',
    technicalContactRole: 'Field Applications Scientist',
    healthScore: 85,
    lastMeeting: '2026-03-15',
    nextReview: '2026-06-15',
    meetingNotes: [
      { date: '2026-03-15', type: 'QBR', notes: 'Discussed XLEAP chemistry timeline. Beta access Q2.' },
      { date: '2026-01-20', type: 'Technical', notes: 'DRAGEN v4.3 validation kickoff for heme panel.' },
    ],
    pipelineActivities: [
      { id: 'pipe-1', description: 'XLEAP chemistry beta evaluation', status: 'in_progress', startDate: '2026-02-01', targetDate: '2026-06-30', value: 120000 },
      { id: 'pipe-2', description: 'NovaSeq X Plus upgrade (2 units)', status: 'approved', startDate: '2026-04-01', targetDate: '2026-07-01', value: 680000 },
    ],
    riskFactors: ['Price increase expected at renewal', 'Element Biosciences competitive pressure'],
    categories: ['Sequencing', 'Analysis'],
  },
  {
    id: 'partner-qiagen',
    vendorKey: 'qiagen',
    status: 'active',
    tier: 'preferred',
    contractStart: '2025-01-01',
    contractEnd: '2026-12-31',
    contractValue: 180000,
    pricingTier: 'premium',
    discountPct: 15,
    paymentTerms: 'Net 30',
    autoRenew: true,
    primaryContact: 'David Park',
    primaryContactRole: 'Account Manager',
    primaryContactEmail: 'dpark@qiagen.com',
    integrationStatus: 'validated',
    validatedProducts: ['qiagen-ffpe-ext', 'qiagen-blood-ext', 'qiagen-qci'],
    integrationNotes: 'QIAamp + QCI Interpret standard in extraction and reporting workflow',
    technicalContact: 'Lisa Wong',
    technicalContactRole: 'Field Applications Specialist',
    healthScore: 78,
    lastMeeting: '2026-02-28',
    nextReview: '2026-05-30',
    meetingNotes: [
      { date: '2026-02-28', type: 'QBR', notes: 'QCI AI enhancements demo. Pricing stable.' },
    ],
    pipelineActivities: [
      { id: 'pipe-3', description: 'QIAseq UMI panel evaluation', status: 'evaluating', startDate: '2026-03-01', targetDate: '2026-08-01', value: 45000 },
    ],
    riskFactors: ['No sequencing offering limits single-vendor workflow'],
    categories: ['Extraction', 'Reporting'],
  },
  {
    id: 'partner-thermo',
    vendorKey: 'thermo',
    status: 'active',
    tier: 'approved',
    contractStart: '2025-03-01',
    contractEnd: '2027-02-28',
    contractValue: 220000,
    pricingTier: 'standard',
    discountPct: 12,
    paymentTerms: 'Net 30',
    autoRenew: false,
    primaryContact: 'James Liu',
    primaryContactRole: 'Regional Sales Manager',
    primaryContactEmail: 'jliu@thermofisher.com',
    integrationStatus: 'validated',
    validatedProducts: ['thermo-magmax-ext', 'thermo-genexus-seq', 'thermo-ion-s5'],
    integrationNotes: 'Genexus primary system for rapid turnaround. Ion S5 backup.',
    technicalContact: 'Amanda Torres',
    technicalContactRole: 'FAS',
    healthScore: 72,
    lastMeeting: '2026-03-01',
    nextReview: '2026-06-01',
    meetingNotes: [
      { date: '2026-03-01', type: 'Product', notes: 'Oncomine Precision Assay v2 roadmap review.' },
    ],
    pipelineActivities: [
      { id: 'pipe-4', description: 'Genexus assay menu expansion', status: 'in_progress', startDate: '2025-11-01', targetDate: '2026-06-30', value: 85000 },
    ],
    riskFactors: ['Genexus throughput ceiling for scaling'],
    categories: ['Extraction', 'Sequencing'],
  },
  {
    id: 'partner-twist',
    vendorKey: 'twist',
    status: 'evaluating',
    tier: 'evaluating',
    contractStart: '',
    contractEnd: '',
    contractValue: 0,
    pricingTier: 'quoted',
    discountPct: 0,
    paymentTerms: '',
    autoRenew: false,
    primaryContact: 'Rachel Kim',
    primaryContactRole: 'Sales Representative',
    primaryContactEmail: 'rkim@twistbioscience.com',
    integrationStatus: 'in_progress',
    validatedProducts: [],
    integrationNotes: 'Evaluating Exome 2.0 against Agilent SureSelect. 2hr hyb promising.',
    technicalContact: 'Neil Patel',
    technicalContactRole: 'Applications Scientist',
    healthScore: 60,
    lastMeeting: '2026-03-20',
    nextReview: '2026-04-30',
    meetingNotes: [
      { date: '2026-03-20', type: 'Demo', notes: 'Twist Exome 2.0 hands-on demo. Uniformity data impressive.' },
    ],
    pipelineActivities: [
      { id: 'pipe-5', description: 'Exome 2.0 validation study', status: 'in_progress', startDate: '2026-03-15', targetDate: '2026-06-15', value: 65000 },
    ],
    riskFactors: ['No IVD products', 'Limited clinical validation data'],
    categories: ['Library Prep'],
  },
  {
    id: 'partner-hamilton',
    vendorKey: 'hamilton',
    status: 'active',
    tier: 'preferred',
    contractStart: '2024-01-01',
    contractEnd: '2027-12-31',
    contractValue: 95000,
    pricingTier: 'service_contract',
    discountPct: 10,
    paymentTerms: 'Net 60',
    autoRenew: true,
    primaryContact: 'Tom Bradley',
    primaryContactRole: 'Automation Specialist',
    primaryContactEmail: 'tbradley@hamiltoncompany.com',
    integrationStatus: 'validated',
    validatedProducts: ['hamilton-star'],
    integrationNotes: 'Hamilton STAR primary automation platform. All NGS library prep methods validated.',
    technicalContact: 'Tom Bradley',
    technicalContactRole: 'Automation Specialist',
    healthScore: 90,
    lastMeeting: '2026-02-10',
    nextReview: '2026-08-10',
    meetingNotes: [
      { date: '2026-02-10', type: 'Service', notes: 'Annual PM completed. Method library updated to v3.2.' },
    ],
    pipelineActivities: [],
    riskFactors: ['Premium pricing vs Opentrons for new stations'],
    categories: ['Automation'],
  },
  {
    id: 'partner-sophia',
    vendorKey: 'sophia',
    status: 'active',
    tier: 'approved',
    contractStart: '2025-06-01',
    contractEnd: '2026-05-31',
    contractValue: 72000,
    pricingTier: 'per_sample',
    discountPct: 8,
    paymentTerms: 'Net 30',
    autoRenew: true,
    primaryContact: 'Marie Dubois',
    primaryContactRole: 'Customer Success Manager',
    primaryContactEmail: 'mdubois@sophiagenetics.com',
    integrationStatus: 'validated',
    validatedProducts: ['sophia-ddm'],
    integrationNotes: 'SOPHiA DDM primary analysis + reporting for solid tumor. Evaluating HRD module.',
    technicalContact: 'Pierre Martin',
    technicalContactRole: 'Bioinformatics Support',
    healthScore: 68,
    lastMeeting: '2026-03-05',
    nextReview: '2026-05-31',
    meetingNotes: [
      { date: '2026-03-05', type: 'Renewal', notes: 'Contract renewal discussion. Requesting HRD module discount.' },
    ],
    pipelineActivities: [
      { id: 'pipe-6', description: 'HRD analysis module evaluation', status: 'evaluating', startDate: '2026-02-01', targetDate: '2026-05-01', value: 28000 },
    ],
    riskFactors: ['Revenue growth slowing at SOPHiA', 'Renewal pricing negotiation'],
    categories: ['Analysis', 'Reporting'],
  },
  {
    id: 'partner-element',
    vendorKey: 'element',
    status: 'prospect',
    tier: 'evaluating',
    contractStart: '',
    contractEnd: '',
    contractValue: 0,
    pricingTier: '',
    discountPct: 0,
    paymentTerms: '',
    autoRenew: false,
    primaryContact: 'Chris Nolan',
    primaryContactRole: 'Business Development',
    primaryContactEmail: 'cnolan@elembio.com',
    integrationStatus: 'planned',
    validatedProducts: [],
    integrationNotes: 'Monitoring AVITI24 as potential Illumina alternative. Need IVD timeline.',
    technicalContact: '',
    technicalContactRole: '',
    healthScore: 45,
    lastMeeting: '2026-01-15',
    nextReview: '2026-04-15',
    meetingNotes: [
      { date: '2026-01-15', type: 'Intro', notes: 'Initial meeting. AVITI24 demo requested. Pricing competitive.' },
    ],
    pipelineActivities: [
      { id: 'pipe-7', description: 'AVITI24 instrument evaluation', status: 'planned', startDate: '2026-05-01', targetDate: '2026-10-01', value: 350000 },
    ],
    riskFactors: ['No IVD clearance', 'Limited installed base for validation'],
    categories: ['Sequencing'],
  },
];

const VALIDATION_RULES = [
  { id: 'share-sum', name: 'Category Share Totals', description: 'Market share within each category should sum to ~100%', severity: 'critical', category: 'consistency' },
  { id: 'regional-sum', name: 'Regional Share Consistency', description: 'Regional shares should not exceed global share significantly', severity: 'warning', category: 'consistency' },
  { id: 'pricing-outlier', name: 'Pricing Outlier Detection', description: 'Product pricing outside 2 standard deviations of category mean', severity: 'warning', category: 'outlier' },
  { id: 'orphan-product', name: 'Orphan Products', description: 'Products with no compatibility entries (isolated in workflow)', severity: 'info', category: 'completeness' },
  { id: 'missing-confidence', name: 'Missing Confidence Data', description: 'Products without confidence metadata for key fields', severity: 'warning', category: 'completeness' },
  { id: 'stale-data', name: 'Stale Data Points', description: 'Data points not updated in 6+ months', severity: 'warning', category: 'freshness' },
  { id: 'vendor-orphan', name: 'Orphan Vendors', description: 'Vendors with no associated products', severity: 'info', category: 'completeness' },
  { id: 'growth-trend-mismatch', name: 'Growth vs Trend Mismatch', description: 'Growth designation conflicts with historical share trajectory', severity: 'warning', category: 'consistency' },
  { id: 'indication-coverage', name: 'Indication Coverage Gaps', description: 'Categories with no products covering key indications', severity: 'info', category: 'completeness' },
  { id: 'partner-contract-expiry', name: 'Partner Contract Expiry', description: 'Partner contracts expiring within 90 days', severity: 'critical', category: 'partner' },
  { id: 'partner-health-low', name: 'Low Partner Health', description: 'Partners with health score below 60', severity: 'warning', category: 'partner' },
  { id: 'partner-integration-gap', name: 'Partner Integration Gaps', description: 'Active partners with unvalidated products', severity: 'info', category: 'partner' },
];

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
  const data = useData();
  const vendors = data?.vendors || DEFAULT_VENDORS;

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
            const vendor = vendors.find(v => v.key === vendorKey);
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
  const data = useData();
  const vendors = data?.vendors || DEFAULT_VENDORS;
  const compatibility = data?.compatibility || DEFAULT_COMPATIBILITY;
  const compatibilityLayers = data?.compatibilityLayers || DEFAULT_COMPATIBILITY_LAYERS;

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
      const compat = compatibility.filter(c => c.layer === 'ext_to_libprep' && c.source === selections.extraction);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    if (stepKey === 'automation' && selections.libprep) {
      const compat = compatibility.filter(c => c.layer === 'libprep_to_auto' && c.source === selections.libprep);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    if (stepKey === 'sequencing' && selections.libprep) {
      const compat = compatibility.filter(c => c.layer === 'libprep_to_seq' && c.source === selections.libprep);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    if (stepKey === 'analysis' && selections.sequencing) {
      const compat = compatibility.filter(c => c.layer === 'seq_to_analysis' && c.source === selections.sequencing);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    if (stepKey === 'reporting' && selections.analysis) {
      const compat = compatibility.filter(c => c.layer === 'analysis_to_report' && c.source === selections.analysis);
      const targetIds = compat.map(c => c.target);
      return categoryProducts.filter(p => targetIds.includes(p.id));
    }

    return categoryProducts;
  };

  const getCompatibilityLevel = (sourceId, targetId, layer) => {
    const compat = compatibility.find(c => c.source === sourceId && c.target === targetId && c.layer === layer);
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
    const c = compatibility.find(x => x.source === src && x.target === tgt && x.layer === layer);
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
          const v = prod ? vendors.find(v => v.key === prod.vendor) : null;
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
                  const v = vendors.find(v => v.key === prod.vendor);
                  const levelColor = { validated: '#10b981', compatible: '#f59e0b', theoretical: '#6b7280', none: '#374151' };
                  const prevLayerKey = prevStep ? compatibilityLayers.find(l => l.target === step.category)?.key : null;
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
const generateBrief = (products, vendors = DEFAULT_VENDORS) => {
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
          ${leaders.map(p => `<tr><td>${p.name}</td><td>${vendors.find(v => v.key === p.vendor)?.label || p.vendor}</td><td>${p.share || 0}%</td></tr>`).join('')}
        </table>
      `;
    }).join('')}

    <h2>Top 5 Products by Market Share</h2>
    <table>
      <tr><th>Product</th><th>Category</th><th>Vendor</th><th>Market Share</th></tr>
      ${topProducts.map(p => `<tr><td>${p.name}</td><td>${p.category}</td><td>${vendors.find(v => v.key === p.vendor)?.label || p.vendor}</td><td>${p.share || 0}%</td></tr>`).join('')}
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

// ============================================
// PARTNERS VIEW
// ============================================

const PartnersView = ({ products, indicationFilter }) => {
  const data = useData();
  const partners = data?.partners || DEFAULT_PARTNERS;
  const vendors = data?.vendors || DEFAULT_VENDORS;
  const [sortBy, setSortBy] = useState('health');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [expandedPartner, setExpandedPartner] = useState(null);

  const filteredPartners = useMemo(() => {
    return partners.filter(p =>
      (filterStatus === 'all' || p.status === filterStatus) &&
      (filterTier === 'all' || p.tier === filterTier)
    ).sort((a, b) => {
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      if (sortBy === 'value') return b.contractValue - a.contractValue;
      if (sortBy === 'expiry') {
        const aExp = new Date(a.contractEnd || '2099-12-31');
        const bExp = new Date(b.contractEnd || '2099-12-31');
        return aExp - bExp;
      }
      return 0;
    });
  }, [partners, filterStatus, filterTier, sortBy]);

  const activeCount = partners.filter(p => p.status === 'active').length;
  const totalValue = partners.filter(p => p.status === 'active').reduce((s, p) => s + p.contractValue, 0);
  const avgHealth = Math.round(partners.filter(p => p.status === 'active').reduce((s, p) => s + p.healthScore, 0) / Math.max(activeCount, 1));

  const expiringCount = partners.filter(p => {
    if (!p.contractEnd) return false;
    const days = (new Date(p.contractEnd) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 90;
  }).length;

  const pipelineTotal = partners.reduce((s, p) => s + p.pipelineActivities.reduce((ps, pa) => ps + pa.value, 0), 0);

  const getCoverageMap = () => {
    const map = {};
    CATEGORIES.forEach(cat => {
      map[cat] = partners.filter(p => p.categories.includes(cat) && p.status === 'active').map(p => vendors.find(v => v.key === p.vendorKey)?.label || p.vendorKey);
    });
    return map;
  };

  const coverageMap = getCoverageMap();

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-900/30 text-green-400 border-green-700';
      case 'evaluating': return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'former': return 'bg-gray-700 text-gray-300 border-gray-600';
      case 'prospect': return 'bg-blue-900/30 text-blue-400 border-blue-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'strategic': return 'bg-red-900/40 border-red-700';
      case 'preferred': return 'bg-orange-900/40 border-orange-700';
      case 'approved': return 'bg-green-900/40 border-green-700';
      case 'evaluating': return 'bg-blue-900/40 border-blue-700';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Active Partners</div>
          <div className="text-3xl font-bold text-white">{activeCount}</div>
          <div className="text-xs text-gray-500 mt-2">Strategic relationships</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Total Contract Value</div>
          <div className="text-3xl font-bold text-white">${(totalValue / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-gray-500 mt-2">Annual commitment</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Avg Health Score</div>
          <div className="text-3xl font-bold text-white">{avgHealth}</div>
          <div className="text-xs text-gray-500 mt-2">Out of 100</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Expiring Soon</div>
          <div className="text-3xl font-bold text-white">{expiringCount}</div>
          <div className="text-xs text-gray-500 mt-2">Within 90 days</div>
        </div>
      </div>

      {/* Filter & Sort */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex gap-4 items-center">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="evaluating">Evaluating</option>
            <option value="prospect">Prospect</option>
            <option value="former">Former</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Tier</label>
          <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white">
            <option value="all">All Tiers</option>
            <option value="strategic">Strategic</option>
            <option value="preferred">Preferred</option>
            <option value="approved">Approved</option>
            <option value="evaluating">Evaluating</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white">
            <option value="health">Health Score</option>
            <option value="value">Contract Value</option>
            <option value="expiry">Expiry Date</option>
          </select>
        </div>
      </div>

      {/* Partner Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Partner Portfolio</h3>
        <div className="grid grid-cols-2 gap-4">
          {filteredPartners.map(partner => {
            const vendor = vendors.find(v => v.key === partner.vendorKey);
            const isExpiring = partner.contractEnd && (new Date(partner.contractEnd) - new Date()) / (1000 * 60 * 60 * 24) <= 90;
            return (
              <div key={partner.id} className={`border rounded-lg p-4 cursor-pointer transition ${expandedPartner === partner.id ? 'bg-gray-750 border-gray-600' : 'bg-gray-800 border-gray-700 hover:border-gray-600'} ${isExpiring ? 'border-yellow-600' : ''}`} onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vendor?.color }}></div>
                    <div>
                      <h4 className="font-semibold text-white">{vendor?.label || partner.vendorKey}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(partner.status)}`}>{partner.status}</span>
                        <span className={`text-xs px-2 py-1 rounded border font-semibold ${getTierColor(partner.tier)}`}>{partner.tier}</span>
                      </div>
                    </div>
                  </div>
                  {isExpiring && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Health: {partner.healthScore}/100</div>
                  <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
                    <div className="h-full" style={{ width: `${partner.healthScore}%`, backgroundColor: getHealthColor(partner.healthScore) }}></div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 space-y-1 mb-3">
                  {partner.contractStart && (
                    <div className="flex justify-between">
                      <span>Contract:</span>
                      <span className={partner.contractEnd ? (isExpiring ? 'text-yellow-400' : 'text-green-400') : 'text-gray-500'}>{partner.contractStart} to {partner.contractEnd || 'N/A'}</span>
                    </div>
                  )}
                  {partner.contractValue > 0 && (
                    <div className="flex justify-between">
                      <span>Value:</span>
                      <span className="text-white font-semibold">${(partner.contractValue / 1000).toFixed(0)}k/yr</span>
                    </div>
                  )}
                  {partner.primaryContact && (
                    <div className="flex justify-between">
                      <span>Contact:</span>
                      <span className="text-white">{partner.primaryContact}</span>
                    </div>
                  )}
                </div>

                {expandedPartner === partner.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2">Commercial Details</h5>
                      <div className="bg-gray-900 rounded p-3 text-xs text-gray-300 space-y-1">
                        <div><span className="text-gray-400">Pricing Tier:</span> {partner.pricingTier}</div>
                        <div><span className="text-gray-400">Discount:</span> {partner.discountPct}%</div>
                        <div><span className="text-gray-400">Terms:</span> {partner.paymentTerms || 'N/A'}</div>
                        <div><span className="text-gray-400">Auto-Renew:</span> {partner.autoRenew ? 'Yes' : 'No'}</div>
                        <div><span className="text-gray-400">Primary Contact:</span> {partner.primaryContact} ({partner.primaryContactRole})</div>
                        <div><span className="text-gray-400">Email:</span> {partner.primaryContactEmail}</div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2">Technical Integration</h5>
                      <div className="bg-gray-900 rounded p-3 text-xs text-gray-300 space-y-1">
                        <div><span className="text-gray-400">Status:</span> <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">{partner.integrationStatus}</span></div>
                        <div><span className="text-gray-400">Validated Products:</span> {partner.validatedProducts.length > 0 ? partner.validatedProducts.join(', ') : 'None'}</div>
                        <div><span className="text-gray-400">Notes:</span> {partner.integrationNotes}</div>
                        <div><span className="text-gray-400">Tech Contact:</span> {partner.technicalContact || 'N/A'} ({partner.technicalContactRole || 'N/A'})</div>
                      </div>
                    </div>

                    {partner.meetingNotes.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Recent Meetings</h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {partner.meetingNotes.map((meeting, i) => (
                            <div key={i} className="bg-gray-900 rounded p-2 text-xs border-l-2 border-gray-600">
                              <div className="flex justify-between text-gray-300">
                                <span className="font-semibold">{meeting.type}</span>
                                <span className="text-gray-500">{meeting.date}</span>
                              </div>
                              <div className="text-gray-400 mt-1">{meeting.notes}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {partner.pipelineActivities.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Pipeline Activities</h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {partner.pipelineActivities.map(activity => (
                            <div key={activity.id} className="bg-gray-900 rounded p-2 text-xs border-l-2 border-gray-600">
                              <div className="flex justify-between text-gray-300 mb-1">
                                <span className="font-semibold">{activity.description}</span>
                                <span className="text-green-400 font-semibold">${(activity.value / 1000).toFixed(0)}k</span>
                              </div>
                              <div className="flex justify-between text-gray-500 text-[10px]">
                                <span className={`px-2 py-0.5 rounded ${activity.status === 'approved' ? 'bg-green-900/30 text-green-300' : activity.status === 'in_progress' ? 'bg-blue-900/30 text-blue-300' : activity.status === 'evaluating' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-gray-700 text-gray-300'}`}>{activity.status}</span>
                                <span>{activity.startDate} → {activity.targetDate}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {partner.riskFactors.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 text-orange-400">Risk Factors</h5>
                        <ul className="text-xs text-orange-300 space-y-1 list-disc list-inside">
                          {partner.riskFactors.map((risk, i) => <li key={i}>{risk}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Tracker */}
      {pipelineTotal > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Pipeline Activities</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400 text-left">
                  <th className="pb-3 pl-3">Partner</th>
                  <th className="pb-3">Activity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Value</th>
                  <th className="pb-3">Target Date</th>
                </tr>
              </thead>
              <tbody>
                {partners.flatMap(p => p.pipelineActivities.map(activity => ({...activity, partner: p, vendorLabel: vendors.find(v => v.key === p.vendorKey)?.label}))).sort((a, b) => new Date(b.targetDate) - new Date(a.targetDate)).map((activity, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td className="py-3 pl-3 font-semibold text-white">{activity.vendorLabel || activity.partner.vendorKey}</td>
                    <td className="py-3">{activity.description}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${activity.status === 'approved' ? 'bg-green-900/40 text-green-300' : activity.status === 'in_progress' ? 'bg-blue-900/40 text-blue-300' : activity.status === 'evaluating' ? 'bg-yellow-900/40 text-yellow-300' : 'bg-gray-700 text-gray-300'}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="py-3 text-green-400 font-semibold">${(activity.value / 1000).toFixed(0)}k</td>
                    <td className="py-3 text-gray-400">{activity.targetDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-300 flex justify-between">
            <span>Total Pipeline Value:</span>
            <span className="text-green-400 font-semibold text-lg">${(pipelineTotal / 1000000).toFixed(2)}M</span>
          </div>
        </div>
      )}

      {/* Vendor Coverage Map */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Vendor Coverage by Workflow</h3>
        <div className="space-y-3">
          {CATEGORIES.map(cat => (
            <div key={cat} className="flex items-center gap-4">
              <div className="w-32 text-sm font-semibold text-gray-300">{cat}</div>
              <div className="flex-1 flex flex-wrap gap-2">
                {coverageMap[cat]?.length > 0 ? (
                  coverageMap[cat].map((vendor, i) => (
                    <span key={i} className="px-3 py-1 bg-green-900/30 text-green-300 rounded text-xs border border-green-700">{vendor}</span>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs italic">No active coverage</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// VALIDATION VIEW
// ============================================

const ValidationView = ({ products }) => {
  const data = useData();
  const vendors = data?.vendors || DEFAULT_VENDORS;
  const compatibility = data?.compatibility || DEFAULT_COMPATIBILITY;
  const partners = data?.partners || DEFAULT_PARTNERS;
  const historicalSnapshots = data?.historicalSnapshots || DEFAULT_HISTORICAL_SNAPSHOTS;
  const [validationHistory, setValidationHistory] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const validationFindings = useMemo(() => {
    const findings = [];

    // Share sum check
    CATEGORIES.forEach(cat => {
      const sum = products.filter(p => p.category === cat).reduce((s, p) => s + (p.share || 0), 0);
      if (Math.abs(sum - 100) > 5) {
        findings.push({ ruleId: 'share-sum', severity: 'critical', category: 'consistency', message: `${cat} shares sum to ${sum.toFixed(1)}% (expected ~100%)`, detail: cat });
      }
    });

    // Regional share consistency
    products.forEach(p => {
      if (p.regionalShare) {
        const maxRegional = Math.max(p.regionalShare.na || 0, p.regionalShare.we || 0, p.regionalShare.hg || 0, p.regionalShare.od || 0);
        if (maxRegional > (p.share || 0) * 3 && (p.share || 0) > 2) {
          findings.push({ ruleId: 'regional-sum', severity: 'warning', category: 'consistency', message: `${p.name}: regional share (${maxRegional}%) seems high vs global (${p.share}%)`, detail: p.id });
        }
      }
    });

    // Pricing outliers
    CATEGORIES.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat && p.pricing > 0);
      if (catProducts.length >= 3) {
        const mean = catProducts.reduce((s, p) => s + p.pricing, 0) / catProducts.length;
        const stdDev = Math.sqrt(catProducts.reduce((s, p) => s + Math.pow(p.pricing - mean, 2), 0) / catProducts.length);
        catProducts.forEach(p => {
          if (Math.abs(p.pricing - mean) > 2 * stdDev) {
            findings.push({ ruleId: 'pricing-outlier', severity: 'warning', category: 'outlier', message: `${p.name}: pricing $${p.pricing} is ${p.pricing > mean ? 'above' : 'below'} category avg $${mean.toFixed(0)}`, detail: p.id });
          }
        });
      }
    });

    // Orphan products
    products.forEach(p => {
      const hasCompat = compatibility.some(c => c.source === p.id || c.target === p.id);
      if (!hasCompat) {
        findings.push({ ruleId: 'orphan-product', severity: 'info', category: 'completeness', message: `${p.name} has no compatibility entries`, detail: p.id });
      }
    });

    // Missing confidence
    products.forEach(p => {
      if (!p.confidence || !p.confidence.share || !p.confidence.pricing) {
        findings.push({ ruleId: 'missing-confidence', severity: 'warning', category: 'completeness', message: `${p.name} missing confidence metadata`, detail: p.id });
      }
    });

    // Orphan vendors
    vendors.forEach(v => {
      if (!products.some(p => p.vendor === v.key)) {
        findings.push({ ruleId: 'vendor-orphan', severity: 'info', category: 'completeness', message: `Vendor ${v.label} has no products`, detail: v.key });
      }
    });

    // Partner contract expiry
    partners.forEach(p => {
      if (p.status === 'active' && p.contractEnd) {
        const daysToExpiry = (new Date(p.contractEnd) - new Date()) / (1000 * 60 * 60 * 24);
        const vendorLabel = vendors.find(v => v.key === p.vendorKey)?.label || p.vendorKey;
        if (daysToExpiry < 90 && daysToExpiry > 0) {
          findings.push({ ruleId: 'partner-contract-expiry', severity: 'critical', category: 'partner', message: `${vendorLabel} contract expires in ${Math.round(daysToExpiry)} days (${p.contractEnd})`, detail: p.id });
        }
      }
    });

    // Partner health
    partners.forEach(p => {
      if (p.healthScore < 60 && p.status === 'active') {
        const vendorLabel = vendors.find(v => v.key === p.vendorKey)?.label || p.vendorKey;
        findings.push({ ruleId: 'partner-health-low', severity: 'warning', category: 'partner', message: `${vendorLabel} health score ${p.healthScore}/100`, detail: p.id });
      }
    });

    return findings;
  }, [products, vendors, compatibility, partners]);

  const filteredFindings = useMemo(() => {
    return validationFindings.filter(f =>
      (filterSeverity === 'all' || f.severity === filterSeverity) &&
      (filterCategory === 'all' || f.category === filterCategory)
    );
  }, [validationFindings, filterSeverity, filterCategory]);

  const criticalCount = validationFindings.filter(f => f.severity === 'critical').length;
  const warningCount = validationFindings.filter(f => f.severity === 'warning').length;
  const infoCount = validationFindings.filter(f => f.severity === 'info').length;

  const integrityScore = Math.max(0, Math.min(100, Math.round((1 - (criticalCount * 10 + warningCount * 3 + infoCount * 1) / (products.length * 3 + partners.length * 3)) * 100)));

  const handleRunValidation = () => {
    setValidationHistory([{ timestamp: new Date().toLocaleString(), score: integrityScore, critical: criticalCount, warnings: warningCount }, ...validationHistory.slice(0, 9)]);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-900/30 text-red-300 border-red-700';
      case 'warning': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'info': return 'bg-blue-900/30 text-blue-300 border-blue-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Score Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Data Integrity Score</h2>
            <p className="text-gray-400 text-sm">Automated validation across products, vendors, and partners</p>
          </div>
          <button onClick={handleRunValidation} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-semibold">
            <RefreshCw className="w-4 h-4" />
            Run Validation
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-900 rounded p-4 border border-gray-700">
            <div className="text-3xl font-bold text-white mb-1">{integrityScore}</div>
            <div className="text-xs text-gray-400">Overall Score</div>
          </div>
          <div className="bg-red-900/20 rounded p-4 border border-red-700">
            <div className="text-3xl font-bold text-red-400 mb-1">{criticalCount}</div>
            <div className="text-xs text-red-400">Critical Issues</div>
          </div>
          <div className="bg-yellow-900/20 rounded p-4 border border-yellow-700">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{warningCount}</div>
            <div className="text-xs text-yellow-400">Warnings</div>
          </div>
          <div className="bg-blue-900/20 rounded p-4 border border-blue-700">
            <div className="text-3xl font-bold text-blue-400 mb-1">{infoCount}</div>
            <div className="text-xs text-blue-400">Info Items</div>
          </div>
          <div className="bg-gray-900 rounded p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Last Run</div>
            <div className="text-xs text-white">{validationHistory[0]?.timestamp || 'Never'}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex gap-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Severity</label>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white">
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white">
            <option value="all">All Categories</option>
            <option value="consistency">Consistency</option>
            <option value="outlier">Outlier</option>
            <option value="completeness">Completeness</option>
            <option value="freshness">Freshness</option>
            <option value="partner">Partner</option>
          </select>
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Validation Findings ({filteredFindings.length})</h3>
        {filteredFindings.length === 0 ? (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-300 font-semibold">No validation issues found!</p>
            <p className="text-green-400 text-sm mt-1">All data quality checks passed</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredFindings.map((finding, idx) => (
              <div key={idx} className={`rounded-lg p-3 border flex items-start gap-3 ${getSeverityColor(finding.severity)}`}>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{finding.message}</div>
                  <div className="text-xs mt-1 opacity-75">{finding.ruleId} • {finding.category}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation History */}
      {validationHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Validation History</h3>
          <div className="space-y-2">
            {validationHistory.map((run, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-900 rounded p-3 text-sm">
                <span className="text-gray-400">{run.timestamp}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white font-semibold">{run.score}/100</div>
                    <div className="text-xs text-gray-500">{run.critical} critical, {run.warnings} warnings</div>
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
// ADMIN VIEW
// ============================================

const AdminView = () => {
  const data = useData();
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [currentQuarter, setCurrentQuarter] = useState('2026-Q1');
  const [compatLayerFilter, setCompatLayerFilter] = useState('');
  const [historyPage, setHistoryPage] = useState(0);

  if (!data) return <div className="p-8">Loading data context...</div>;

  const {
    vendors, setVendors,
    products, setProducts,
    timelineEvents, setTimelineEvents,
    compatibility, setCompatibility,
    compatibilityLayers, setCompatibilityLayers,
    historicalSnapshots, setHistoricalSnapshots,
    marketSize, setMarketSize,
    intelSignals, setIntelSignals,
    costComponents, setCostComponents,
    partners, setPartners,
  } = data;

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = () => {
    const exportData = {
      version: '4.0',
      exportDate: new Date().toISOString().split('T')[0],
      vendors,
      products,
      timelineEvents,
      compatibility,
      compatibilityLayers,
      historicalSnapshots,
      marketSize,
      intelSignals,
      costComponents,
      partners,
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ngs-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result);
        if (imported.vendors) setVendors(imported.vendors);
        if (imported.products) setProducts(imported.products);
        if (imported.timelineEvents) setTimelineEvents(imported.timelineEvents);
        if (imported.compatibility) setCompatibility(imported.compatibility);
        if (imported.compatibilityLayers) setCompatibilityLayers(imported.compatibilityLayers);
        if (imported.historicalSnapshots) setHistoricalSnapshots(imported.historicalSnapshots);
        if (imported.marketSize) setMarketSize(imported.marketSize);
        if (imported.intelSignals) setIntelSignals(imported.intelSignals);
        if (imported.costComponents) setCostComponents(imported.costComponents);
        if (imported.partners) setPartners(imported.partners);
        if (imported.financials) setFinancials(imported.financials);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Reset all data to defaults? This cannot be undone.')) {
      setVendors(DEFAULT_VENDORS);
      setProducts(DEFAULT_PRODUCTS);
      setTimelineEvents(DEFAULT_TIMELINE_EVENTS);
      setCompatibility(DEFAULT_COMPATIBILITY);
      setCompatibilityLayers(DEFAULT_COMPATIBILITY_LAYERS);
      setHistoricalSnapshots(DEFAULT_HISTORICAL_SNAPSHOTS);
      setMarketSize(DEFAULT_MARKET_SIZE);
      setIntelSignals(DEFAULT_INTEL_SIGNALS);
      setCostComponents(DEFAULT_COST_COMPONENTS);
      setPartners(DEFAULT_PARTNERS);
      setFinancials(DEFAULT_FINANCIALS);
    }
  };

  const generateCodeConstants = () => {
    const code = `const DEFAULT_VENDORS = ${JSON.stringify(vendors, null, 2)};

const DEFAULT_PRODUCTS = ${JSON.stringify(products, null, 2)};

const DEFAULT_TIMELINE_EVENTS = ${JSON.stringify(timelineEvents, null, 2)};

const DEFAULT_COMPATIBILITY_LAYERS = ${JSON.stringify(compatibilityLayers, null, 2)};

const DEFAULT_COMPATIBILITY = ${JSON.stringify(compatibility, null, 2)};

const DEFAULT_HISTORICAL_SNAPSHOTS = ${JSON.stringify(historicalSnapshots, null, 2)};

const DEFAULT_MARKET_SIZE = ${JSON.stringify(marketSize, null, 2)};

const DEFAULT_INTEL_SIGNALS = ${JSON.stringify(intelSignals, null, 2)};

const DEFAULT_COST_COMPONENTS = ${JSON.stringify(costComponents, null, 2)};

const DEFAULT_PARTNERS = ${JSON.stringify(partners, null, 2)};

const DEFAULT_FINANCIALS = ${JSON.stringify(financials, null, 2)};`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constants.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderProductsTab = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
        <button
          onClick={() => {
            const newProduct = {
              id: `new-product-${Date.now()}`,
              vendor: vendors[0]?.key || 'illumina',
              name: 'New Product',
              category: CATEGORIES[0],
              tier: 'C',
              share: 0,
              pricing: 0,
              regulatory: 'RUO',
              region: 'global',
              sampleTypes: [],
              nucleicAcids: [],
              regionalShare: { na: 0, we: 0, hg: 0, od: 0 },
              growth: 'stable',
              indications: [],
              indicationShare: {},
              confidence: { share: { level: 'estimated', source: '', date: '' }, pricing: { level: 'estimated', source: '', date: '' }, regulatory: { level: 'verified', source: '', date: '' } },
            };
            setProducts([...products, newProduct]);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center gap-2"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-3 py-2 text-left">ID</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Vendor</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Name</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Category</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Tier</th>
              <th className="border border-gray-700 px-3 py-2 text-right">Share%</th>
              <th className="border border-gray-700 px-3 py-2 text-right">Price</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Reg</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Growth</th>
              <th className="border border-gray-700 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter(p => !searchTerm || p.id.includes(searchTerm) || p.name.includes(searchTerm))
              .map((product, idx) => (
                <React.Fragment key={product.id}>
                  <tr className="border border-gray-700 bg-gray-900 hover:bg-gray-800">
                    <td className="border border-gray-700 px-3 py-2 text-xs">{product.id}</td>
                    <td className="border border-gray-700 px-3 py-2">
                      <select
                        value={product.vendor}
                        onChange={(e) => {
                          const updated = products.map(p => p.id === product.id ? { ...p, vendor: e.target.value } : p);
                          setProducts(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                      >
                        {vendors.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => {
                          const updated = products.map(p => p.id === product.id ? { ...p, name: e.target.value } : p);
                          setProducts(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <select
                        value={product.category}
                        onChange={(e) => {
                          const updated = products.map(p => p.id === product.id ? { ...p, category: e.target.value } : p);
                          setProducts(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <input
                        type="text"
                        value={product.tier}
                        onChange={(e) => {
                          const updated = products.map(p => p.id === product.id ? { ...p, tier: e.target.value } : p);
                          setProducts(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2 text-right">
                      <input
                        type="number"
                        value={product.share}
                        onChange={(e) => {
                          const updated = products.map(p => p.id === product.id ? { ...p, share: parseFloat(e.target.value) || 0 } : p);
                          setProducts(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                        step="0.1"
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2 text-right">
                      <input
                        type="number"
                        value={product.pricing}
                        onChange={(e) => {
                          const updated = products.map(p => p.id === product.id ? { ...p, pricing: parseFloat(e.target.value) || 0 } : p);
                          setProducts(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                        step="0.1"
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2 text-xs">
                      <select
                        value={product.regulatory}
                        onChange={(e) => {
                          const updated = products.map(p => p.id === product.id ? { ...p, regulatory: e.target.value } : p);
                          setProducts(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                      >
                        <option value="RUO">RUO</option>
                        <option value="CE-IVD">CE-IVD</option>
                        <option value="FDA 510k">FDA 510k</option>
                      </select>
                    </td>
                    <td className="border border-gray-700 px-3 py-2 text-xs">
                      <select
                        value={product.growth}
                        onChange={(e) => {
                          const updated = products.map(p => p.id === product.id ? { ...p, growth: e.target.value } : p);
                          setProducts(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                      >
                        <option value="stable">Stable</option>
                        <option value="growing">Growing</option>
                        <option value="declining">Declining</option>
                      </select>
                    </td>
                    <td className="border border-gray-700 px-3 py-2 flex gap-1">
                      <button
                        onClick={() => toggleRowExpand(product.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                        title="Expand"
                      >
                        {expandedRows[product.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this product?')) {
                            setProducts(products.filter(p => p.id !== product.id));
                          }
                        }}
                        className="p-1 hover:bg-red-900 rounded text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  {expandedRows[product.id] && (
                    <tr className="bg-gray-800 border border-gray-700">
                      <td colSpan="10" className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-300 block mb-2">Regional Share</label>
                            <div className="grid grid-cols-4 gap-2">
                              {['na', 'we', 'hg', 'od'].map(region => (
                                <div key={region}>
                                  <label className="text-xs text-gray-400">{region.toUpperCase()}</label>
                                  <input
                                    type="number"
                                    value={product.regionalShare?.[region] || 0}
                                    onChange={(e) => {
                                      const updated = products.map(p => p.id === product.id ? {
                                        ...p,
                                        regionalShare: { ...p.regionalShare, [region]: parseFloat(e.target.value) || 0 }
                                      } : p);
                                      setProducts(updated);
                                    }}
                                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-300 block mb-2">Indications</label>
                            <div className="space-y-1">
                              {INDICATIONS.map(ind => (
                                <label key={ind.key} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={product.indications?.includes(ind.key) || false}
                                    onChange={(e) => {
                                      const updated = products.map(p => p.id === product.id ? {
                                        ...p,
                                        indications: e.target.checked
                                          ? [...(p.indications || []), ind.key]
                                          : p.indications?.filter(i => i !== ind.key)
                                      } : p);
                                      setProducts(updated);
                                    }}
                                    className="w-4 h-4"
                                  />
                                  {ind.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVendorsTab = () => (
    <div className="space-y-4">
      <button
        onClick={() => {
          const newVendor = {
            key: `vendor-${Date.now()}`,
            label: 'New Vendor',
            color: '#ffffff',
            strength: '',
            weakness: '',
            recentMove: '',
          };
          setVendors([...vendors, newVendor]);
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center gap-2"
      >
        <Plus size={16} /> Add Vendor
      </button>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-3 py-2 text-left">Key</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Label</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Color</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Strength</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Weakness</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Recent Move</th>
              <th className="border border-gray-700 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.key} className="border border-gray-700 bg-gray-900 hover:bg-gray-800">
                <td className="border border-gray-700 px-3 py-2 text-xs font-mono">{vendor.key}</td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="text"
                    value={vendor.label}
                    onChange={(e) => {
                      const updated = vendors.map(v => v.key === vendor.key ? { ...v, label: e.target.value } : v);
                      setVendors(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={vendor.color}
                      onChange={(e) => {
                        const updated = vendors.map(v => v.key === vendor.key ? { ...v, color: e.target.value } : v);
                        setVendors(updated);
                      }}
                      className="h-8 w-12 cursor-pointer border border-gray-600"
                    />
                    <span className="text-xs text-gray-400">{vendor.color}</span>
                  </div>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="text"
                    value={vendor.strength}
                    onChange={(e) => {
                      const updated = vendors.map(v => v.key === vendor.key ? { ...v, strength: e.target.value } : v);
                      setVendors(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="text"
                    value={vendor.weakness}
                    onChange={(e) => {
                      const updated = vendors.map(v => v.key === vendor.key ? { ...v, weakness: e.target.value } : v);
                      setVendors(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="text"
                    value={vendor.recentMove}
                    onChange={(e) => {
                      const updated = vendors.map(v => v.key === vendor.key ? { ...v, recentMove: e.target.value } : v);
                      setVendors(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this vendor?')) {
                        setVendors(vendors.filter(v => v.key !== vendor.key));
                      }
                    }}
                    className="p-1 hover:bg-red-900 rounded text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPartnersTab = () => (
    <div className="space-y-4">
      <button
        onClick={() => {
          const newPartner = {
            id: `partner-${Date.now()}`,
            vendorKey: '',
            status: 'evaluating',
            tier: 'evaluating',
            contractStart: '',
            contractEnd: '',
            contractValue: 0,
            pricingTier: 'quoted',
            discountPct: 0,
            paymentTerms: '',
            autoRenew: false,
            primaryContact: '',
            primaryContactRole: '',
            primaryContactEmail: '',
            integrationStatus: 'planned',
            validatedProducts: [],
            integrationNotes: '',
            technicalContact: '',
            technicalContactRole: '',
            healthScore: 50,
            lastMeeting: '',
            nextReview: '',
            meetingNotes: [],
            pipelineActivities: [],
            riskFactors: [],
            categories: [],
          };
          setPartners([...partners, newPartner]);
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center gap-2"
      >
        <Plus size={16} /> Add Partner
      </button>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-3 py-2 text-left">Vendor</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Status</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Tier</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Health</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Value</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Expiry</th>
              <th className="border border-gray-700 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border border-gray-700 bg-gray-900 hover:bg-gray-800">
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={partner.vendorKey}
                    onChange={(e) => {
                      const updated = partners.map(p => p.id === partner.id ? { ...p, vendorKey: e.target.value } : p);
                      setPartners(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
                  </select>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={partner.status}
                    onChange={(e) => {
                      const updated = partners.map(p => p.id === partner.id ? { ...p, status: e.target.value } : p);
                      setPartners(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  >
                    <option value="active">Active</option>
                    <option value="evaluating">Evaluating</option>
                    <option value="prospect">Prospect</option>
                    <option value="former">Former</option>
                  </select>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={partner.tier}
                    onChange={(e) => {
                      const updated = partners.map(p => p.id === partner.id ? { ...p, tier: e.target.value } : p);
                      setPartners(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  >
                    <option value="strategic">Strategic</option>
                    <option value="preferred">Preferred</option>
                    <option value="approved">Approved</option>
                    <option value="evaluating">Evaluating</option>
                  </select>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={partner.healthScore}
                    onChange={(e) => {
                      const updated = partners.map(p => p.id === partner.id ? { ...p, healthScore: parseInt(e.target.value) } : p);
                      setPartners(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-16"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="number"
                    value={partner.contractValue}
                    onChange={(e) => {
                      const updated = partners.map(p => p.id === partner.id ? { ...p, contractValue: parseInt(e.target.value) } : p);
                      setPartners(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-20"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="date"
                    value={partner.contractEnd}
                    onChange={(e) => {
                      const updated = partners.map(p => p.id === partner.id ? { ...p, contractEnd: e.target.value } : p);
                      setPartners(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this partner?')) {
                        setPartners(partners.filter(p => p.id !== partner.id));
                      }
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMarketSizingTab = () => (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">By Category</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(marketSize.byCategory || {}).map(([cat, val]) => (
            <div key={cat}>
              <label className="text-sm text-gray-400 block mb-1">{cat}</label>
              <input
                type="number"
                value={val}
                onChange={(e) => {
                  setMarketSize({
                    ...marketSize,
                    byCategory: { ...marketSize.byCategory, [cat]: parseInt(e.target.value) || 0 }
                  });
                }}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">By Indication</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(marketSize.byIndication || {}).map(([ind, val]) => (
            <div key={ind}>
              <label className="text-sm text-gray-400 block mb-1">{ind}</label>
              <input
                type="number"
                value={val}
                onChange={(e) => {
                  setMarketSize({
                    ...marketSize,
                    byIndication: { ...marketSize.byIndication, [ind]: parseInt(e.target.value) || 0 }
                  });
                }}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">By Region</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(marketSize.byRegion || {}).map(([reg, val]) => (
            <div key={reg}>
              <label className="text-sm text-gray-400 block mb-1">{reg}</label>
              <input
                type="number"
                value={val}
                onChange={(e) => {
                  setMarketSize({
                    ...marketSize,
                    byRegion: { ...marketSize.byRegion, [reg]: parseFloat(e.target.value) || 0 }
                  });
                }}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-full"
                step="0.01"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Total NGS</label>
          <input
            type="number"
            value={marketSize.totalNGS || 0}
            onChange={(e) => {
              setMarketSize({ ...marketSize, totalNGS: parseInt(e.target.value) || 0 });
            }}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-full"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">CAGR</label>
          <input
            type="number"
            value={marketSize.cagr || 0}
            onChange={(e) => {
              setMarketSize({ ...marketSize, cagr: parseFloat(e.target.value) || 0 });
            }}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-full"
            step="0.001"
          />
        </div>
      </div>
    </div>
  );

  const renderHistoricalDataTab = () => {
    const quarters = historicalSnapshots.map(h => h.quarter);
    const currentSnapshot = historicalSnapshots.find(h => h.quarter === currentQuarter);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 items-center mb-4">
          <label className="text-sm text-gray-400">Quarter:</label>
          <select
            value={currentQuarter}
            onChange={(e) => setCurrentQuarter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            {quarters.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        {currentSnapshot && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 px-3 py-2 text-left">Product ID</th>
                  <th className="border border-gray-700 px-3 py-2 text-right">Share %</th>
                  <th className="border border-gray-700 px-3 py-2 text-right">Pricing</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(currentSnapshot.data).map(([productId, values]) => (
                  <tr key={productId} className="border border-gray-700 bg-gray-900 hover:bg-gray-800">
                    <td className="border border-gray-700 px-3 py-2 text-xs font-mono">{productId}</td>
                    <td className="border border-gray-700 px-3 py-2">
                      <input
                        type="number"
                        value={values.share}
                        onChange={(e) => {
                          const updated = historicalSnapshots.map(h => h.quarter === currentQuarter ? {
                            ...h,
                            data: { ...h.data, [productId]: { ...values, share: parseFloat(e.target.value) || 0 } }
                          } : h);
                          setHistoricalSnapshots(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                        step="0.1"
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <input
                        type="number"
                        value={values.pricing}
                        onChange={(e) => {
                          const updated = historicalSnapshots.map(h => h.quarter === currentQuarter ? {
                            ...h,
                            data: { ...h.data, [productId]: { ...values, pricing: parseFloat(e.target.value) || 0 } }
                          } : h);
                          setHistoricalSnapshots(updated);
                        }}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                        step="0.1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderCostComponentsTab = () => (
    <div className="space-y-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="border border-gray-700 px-3 py-2 text-left">Product ID</th>
            <th className="border border-gray-700 px-3 py-2 text-right">Reagents</th>
            <th className="border border-gray-700 px-3 py-2 text-right">Instrument</th>
            <th className="border border-gray-700 px-3 py-2 text-right">Labor</th>
            <th className="border border-gray-700 px-3 py-2 text-right">QC</th>
            <th className="border border-gray-700 px-3 py-2 text-right">Total</th>
            <th className="border border-gray-700 px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(costComponents).map(([productId, costs]) => (
            <tr key={productId} className="border border-gray-700 bg-gray-900 hover:bg-gray-800">
              <td className="border border-gray-700 px-3 py-2 text-xs font-mono">{productId}</td>
              <td className="border border-gray-700 px-3 py-2">
                <input
                  type="number"
                  value={costs.reagents}
                  onChange={(e) => {
                    const newCosts = {
                      ...costs,
                      reagents: parseFloat(e.target.value) || 0,
                      total: (parseFloat(e.target.value) || 0) + costs.instrument_amortized + costs.labor + costs.qc
                    };
                    setCostComponents({ ...costComponents, [productId]: newCosts });
                  }}
                  className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                  step="0.1"
                />
              </td>
              <td className="border border-gray-700 px-3 py-2">
                <input
                  type="number"
                  value={costs.instrument_amortized}
                  onChange={(e) => {
                    const newCosts = {
                      ...costs,
                      instrument_amortized: parseFloat(e.target.value) || 0,
                      total: costs.reagents + (parseFloat(e.target.value) || 0) + costs.labor + costs.qc
                    };
                    setCostComponents({ ...costComponents, [productId]: newCosts });
                  }}
                  className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                  step="0.1"
                />
              </td>
              <td className="border border-gray-700 px-3 py-2">
                <input
                  type="number"
                  value={costs.labor}
                  onChange={(e) => {
                    const newCosts = {
                      ...costs,
                      labor: parseFloat(e.target.value) || 0,
                      total: costs.reagents + costs.instrument_amortized + (parseFloat(e.target.value) || 0) + costs.qc
                    };
                    setCostComponents({ ...costComponents, [productId]: newCosts });
                  }}
                  className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                  step="0.1"
                />
              </td>
              <td className="border border-gray-700 px-3 py-2">
                <input
                  type="number"
                  value={costs.qc}
                  onChange={(e) => {
                    const newCosts = {
                      ...costs,
                      qc: parseFloat(e.target.value) || 0,
                      total: costs.reagents + costs.instrument_amortized + costs.labor + (parseFloat(e.target.value) || 0)
                    };
                    setCostComponents({ ...costComponents, [productId]: newCosts });
                  }}
                  className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                  step="0.1"
                />
              </td>
              <td className="border border-gray-700 px-3 py-2 text-right font-semibold">{costs.total.toFixed(2)}</td>
              <td className="border border-gray-700 px-3 py-2">
                <button
                  onClick={() => {
                    if (window.confirm('Delete cost for this product?')) {
                      const updated = { ...costComponents };
                      delete updated[productId];
                      setCostComponents(updated);
                    }
                  }}
                  className="p-1 hover:bg-red-900 rounded text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderIntelSignalsTab = () => (
    <div className="space-y-4">
      <button
        onClick={() => {
          const newSignal = {
            id: `sig-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'regulatory',
            vendor: vendors[0]?.key || 'illumina',
            title: 'New Signal',
            impact: 'medium',
            summary: '',
            source: '',
            products: [],
          };
          setIntelSignals([...intelSignals, newSignal]);
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center gap-2"
      >
        <Plus size={16} /> Add Signal
      </button>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-3 py-2 text-left">Date</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Type</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Vendor</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Title</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Impact</th>
              <th className="border border-gray-700 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {intelSignals.map((signal) => (
              <tr key={signal.id} className="border border-gray-700 bg-gray-900 hover:bg-gray-800">
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="date"
                    value={signal.date}
                    onChange={(e) => {
                      const updated = intelSignals.map(s => s.id === signal.id ? { ...s, date: e.target.value } : s);
                      setIntelSignals(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={signal.type}
                    onChange={(e) => {
                      const updated = intelSignals.map(s => s.id === signal.id ? { ...s, type: e.target.value } : s);
                      setIntelSignals(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  >
                    <option value="regulatory">Regulatory</option>
                    <option value="pricing">Pricing</option>
                    <option value="product_launch">Product Launch</option>
                    <option value="partnership">Partnership</option>
                    <option value="market_entry">Market Entry</option>
                    <option value="acquisition">Acquisition</option>
                    <option value="clinical_data">Clinical Data</option>
                  </select>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={signal.vendor}
                    onChange={(e) => {
                      const updated = intelSignals.map(s => s.id === signal.id ? { ...s, vendor: e.target.value } : s);
                      setIntelSignals(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  >
                    {vendors.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
                  </select>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="text"
                    value={signal.title}
                    onChange={(e) => {
                      const updated = intelSignals.map(s => s.id === signal.id ? { ...s, title: e.target.value } : s);
                      setIntelSignals(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={signal.impact}
                    onChange={(e) => {
                      const updated = intelSignals.map(s => s.id === signal.id ? { ...s, impact: e.target.value } : s);
                      setIntelSignals(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this signal?')) {
                        setIntelSignals(intelSignals.filter(s => s.id !== signal.id));
                      }
                    }}
                    className="p-1 hover:bg-red-900 rounded text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompatibilityTab = () => {
    const filteredCompat = compatLayerFilter
      ? compatibility.filter(c => c.layer === compatLayerFilter)
      : compatibility;
    const pageSize = 50;
    const paginatedCompat = filteredCompat.slice(historyPage * pageSize, (historyPage + 1) * pageSize);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <select
            value={compatLayerFilter}
            onChange={(e) => {
              setCompatLayerFilter(e.target.value);
              setHistoryPage(0);
            }}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="">All Layers</option>
            {compatibilityLayers.map(layer => (
              <option key={layer.key} value={layer.key}>{layer.label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const newCompat = {
                source: products[0]?.id || '',
                target: products[1]?.id || '',
                layer: compatibilityLayers[0]?.key || 'ext_to_libprep',
                level: 'compatible',
                notes: '',
                protocol: '',
              };
              setCompatibility([...compatibility, newCompat]);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center gap-2"
          >
            <Plus size={16} /> Add Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-3 py-2 text-left">Source</th>
                <th className="border border-gray-700 px-3 py-2 text-left">Target</th>
                <th className="border border-gray-700 px-3 py-2 text-left">Layer</th>
                <th className="border border-gray-700 px-3 py-2 text-left">Level</th>
                <th className="border border-gray-700 px-3 py-2 text-left">Notes</th>
                <th className="border border-gray-700 px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompat.map((entry, idx) => (
                <tr key={idx} className="border border-gray-700 bg-gray-900 hover:bg-gray-800">
                  <td className="border border-gray-700 px-3 py-2 text-xs">
                    <select
                      value={entry.source}
                      onChange={(e) => {
                        const updated = compatibility.map((c, i) => i === (historyPage * 50 + idx) ? { ...c, source: e.target.value } : c);
                        setCompatibility(updated);
                      }}
                      className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                    </select>
                  </td>
                  <td className="border border-gray-700 px-3 py-2 text-xs">
                    <select
                      value={entry.target}
                      onChange={(e) => {
                        const updated = compatibility.map((c, i) => i === (historyPage * 50 + idx) ? { ...c, target: e.target.value } : c);
                        setCompatibility(updated);
                      }}
                      className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                    </select>
                  </td>
                  <td className="border border-gray-700 px-3 py-2 text-xs">
                    <select
                      value={entry.layer}
                      onChange={(e) => {
                        const updated = compatibility.map((c, i) => i === (historyPage * 50 + idx) ? { ...c, layer: e.target.value } : c);
                        setCompatibility(updated);
                      }}
                      className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                    >
                      {compatibilityLayers.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                    </select>
                  </td>
                  <td className="border border-gray-700 px-3 py-2 text-xs">
                    <select
                      value={entry.level}
                      onChange={(e) => {
                        const updated = compatibility.map((c, i) => i === (historyPage * 50 + idx) ? { ...c, level: e.target.value } : c);
                        setCompatibility(updated);
                      }}
                      className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                    >
                      <option value="validated">Validated</option>
                      <option value="compatible">Compatible</option>
                      <option value="not_compatible">Not Compatible</option>
                    </select>
                  </td>
                  <td className="border border-gray-700 px-3 py-2 text-xs">
                    <input
                      type="text"
                      value={entry.notes}
                      onChange={(e) => {
                        const updated = compatibility.map((c, i) => i === (historyPage * 50 + idx) ? { ...c, notes: e.target.value } : c);
                        setCompatibility(updated);
                      }}
                      className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                    />
                  </td>
                  <td className="border border-gray-700 px-3 py-2">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this entry?')) {
                          setCompatibility(compatibility.filter((_, i) => i !== (historyPage * 50 + idx)));
                        }
                      }}
                      className="p-1 hover:bg-red-900 rounded text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Page {historyPage + 1} of {Math.ceil(filteredCompat.length / 50)}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setHistoryPage(Math.max(0, historyPage - 1))}
              disabled={historyPage === 0}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded"
            >
              Previous
            </button>
            <button
              onClick={() => setHistoryPage(Math.min(Math.ceil(filteredCompat.length / 50) - 1, historyPage + 1))}
              disabled={historyPage >= Math.ceil(filteredCompat.length / 50) - 1}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineTab = () => (
    <div className="space-y-4">
      <button
        onClick={() => {
          const newEvent = {
            year: new Date().getFullYear(),
            event: 'New Event',
            vendor: vendors[0]?.key || 'illumina',
            impact: 'Medium',
          };
          setTimelineEvents([...timelineEvents, newEvent]);
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center gap-2"
      >
        <Plus size={16} /> Add Event
      </button>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-3 py-2 text-left">Year</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Event</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Vendor</th>
              <th className="border border-gray-700 px-3 py-2 text-left">Impact</th>
              <th className="border border-gray-700 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timelineEvents.map((event, idx) => (
              <tr key={idx} className="border border-gray-700 bg-gray-900 hover:bg-gray-800">
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="number"
                    value={event.year}
                    onChange={(e) => {
                      const updated = timelineEvents.map((evt, i) => i === idx ? { ...evt, year: parseInt(e.target.value) || 2026 } : evt);
                      setTimelineEvents(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full text-right"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <input
                    type="text"
                    value={event.event}
                    onChange={(e) => {
                      const updated = timelineEvents.map((evt, i) => i === idx ? { ...evt, event: e.target.value } : evt);
                      setTimelineEvents(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 w-full"
                  />
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={event.vendor}
                    onChange={(e) => {
                      const updated = timelineEvents.map((evt, i) => i === idx ? { ...evt, vendor: e.target.value } : evt);
                      setTimelineEvents(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  >
                    {vendors.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
                    <option value="regulatory">Regulatory</option>
                    <option value="industry">Industry</option>
                  </select>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={event.impact}
                    onChange={(e) => {
                      const updated = timelineEvents.map((evt, i) => i === idx ? { ...evt, impact: e.target.value } : evt);
                      setTimelineEvents(updated);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this event?')) {
                        setTimelineEvents(timelineEvents.filter((_, i) => i !== idx));
                      }
                    }}
                    className="p-1 hover:bg-red-900 rounded text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderImportExportTab = () => (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-gray-800 rounded p-4 space-y-4">
        <h3 className="text-lg font-semibold">Data Statistics</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Vendors: {vendors.length}</div>
          <div>Products: {products.length}</div>
          <div>Compatibility: {compatibility.length}</div>
          <div>Timeline Events: {timelineEvents.length}</div>
          <div>Intel Signals: {intelSignals.length}</div>
          <div>Historical Quarters: {historicalSnapshots.length}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Export Data</h3>
        <button
          onClick={handleExport}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-medium flex items-center justify-center gap-2"
        >
          <Download size={18} /> Export All Data (JSON)
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Import Data</h3>
        <label className="block px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium cursor-pointer text-center flex items-center justify-center gap-2">
          <Upload size={18} /> Import Data (JSON)
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Generate Code Constants</h3>
        <button
          onClick={generateCodeConstants}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium flex items-center justify-center gap-2"
        >
          <Copy size={18} /> Generate & Download JS
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Reset Data</h3>
        <button
          onClick={handleReset}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded text-white font-medium flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} /> Reset to Defaults
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'products', label: 'Products', render: renderProductsTab },
    { id: 'vendors', label: 'Vendors', render: renderVendorsTab },
    { id: 'partners', label: 'Partners', render: renderPartnersTab },
    { id: 'market', label: 'Market Sizing', render: renderMarketSizingTab },
    { id: 'history', label: 'Historical Data', render: renderHistoricalDataTab },
    { id: 'costs', label: 'Cost Components', render: renderCostComponentsTab },
    { id: 'signals', label: 'Intel Signals', render: renderIntelSignalsTab },
    { id: 'compatibility', label: 'Compatibility', render: renderCompatibilityTab },
    { id: 'timeline', label: 'Timeline', render: renderTimelineTab },
    { id: 'import', label: 'Import/Export', render: renderImportExportTab },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Data Editor</h2>
        <p className="text-gray-400">Manage all editable data for the NGS Intelligence Platform</p>
      </div>

      <div className="flex gap-2 border-b border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm('');
              setHistoryPage(0);
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded p-6">
        {tabs.find(t => t.id === activeTab)?.render()}
      </div>
    </div>
  );
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
        { name: 'Partners', key: 'partners' },
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
        { name: 'Validation', key: 'validation' },
        { name: 'Data Quality', key: 'data quality' },
        { name: 'Regulatory', key: 'regulatory' },
      ],
    },
    {
      group: 'ADMIN',
      items: [
        { name: 'Data Editor', key: 'admin' },
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
  const data = useData();
  const historicalSnapshots = data?.historicalSnapshots || DEFAULT_HISTORICAL_SNAPSHOTS;

  const history = useMemo(() => {
    return historicalSnapshots.map(s => ({
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
  const data = useData();
  const marketSize = data?.marketSize || DEFAULT_MARKET_SIZE;

  const tam = category ? marketSize.byCategory[category] : indication ? marketSize.byIndication[indication] : marketSize.totalNGS;
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
  const dataContext = useData();
  const vendors = dataContext?.vendors || DEFAULT_VENDORS;

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
        const v = vendors.find(v => v.key === p.vendor);
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
  }, [products, regionKey, vendors]);

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
  const dataContext = useData();
  const vendors = dataContext?.vendors || DEFAULT_VENDORS;

  const [selectedCategory, setSelectedCategory] = useState('Sequencing');
  const catColors = { 'Extraction': '#f59e0b', 'Library Prep': '#3b82f6', 'Automation': '#8b5cf6', 'Sequencing': '#ef4444', 'Analysis': '#10b981', 'Reporting': '#ec4899' };

  const data = useMemo(() => {
    return products
      .filter(p => p.category === selectedCategory)
      .map(p => {
        const v = vendors.find(v => v.key === p.vendor);
        return { name: p.name, share: p.share || 0, pricing: p.pricing || 0, vendor: v?.label || p.vendor, color: v?.color || '#6b7280', tier: p.tier, regulatory: p.regulatory, category: p.category };
      });
  }, [products, selectedCategory, vendors]);

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
  const dataContext = useData();
  const vendors = dataContext?.vendors || DEFAULT_VENDORS;

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
        const v = vendors.find(v => v.key === p.vendor);
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
  }, [products, regionKey, vendors]);

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
  const dataContext = useData();
  const vendors = dataContext?.vendors || DEFAULT_VENDORS;

  const data = useMemo(() => {
    const vendorMap = {};
    products.forEach(p => {
      if (!p.growth || !p.share) return;
      if (!vendorMap[p.vendor]) {
        const v = vendors.find(v => v.key === p.vendor);
        vendorMap[p.vendor] = { vendor: v?.label || p.vendor, growing: 0, emerging: 0, declining: 0, stable: 0, color: v?.color || '#6b7280' };
      }
      vendorMap[p.vendor][p.growth] += p.share;
    });
    return Object.values(vendorMap)
      .map(v => ({ ...v, momentum: v.growing + v.emerging - v.declining }))
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, 12);
  }, [products, vendors]);

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
  const data = useData();
  const vendors = data?.vendors || DEFAULT_VENDORS;
  const intelSignals = data?.intelSignals || DEFAULT_INTEL_SIGNALS;
  const marketSize = data?.marketSize || DEFAULT_MARKET_SIZE;
  const partners = data?.partners || DEFAULT_PARTNERS;

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
          onClick={() => generateBrief(filteredProducts, vendors)}
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

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Signals</h3>
          <div className="space-y-2">
            {intelSignals.filter(s => s.impact === 'high').slice(0, 3).map(signal => (
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
              <span className="font-bold text-emerald-400">${marketSize.totalNGS}M</span>
            </div>
            <div className="text-gray-500 text-[10px] space-y-0.5 mt-2">
              <div>Sequencing: ${marketSize.byCategory['Sequencing']}M</div>
              <div>Analysis: ${marketSize.byCategory['Analysis']}M</div>
              <div>Library Prep: ${marketSize.byCategory['Library Prep']}M</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">CAGR & Projections</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>NGS CAGR:</span>
              <span className="font-bold text-blue-400">{(marketSize.cagr * 100).toFixed(1)}%</span>
            </div>
            <div className="text-gray-500 text-[10px] mt-2">
              Projected 2026-2031 TAM growth driven by NGS expansion in liquid biopsy and germline testing
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Partner Pulse</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Active:</span>
              <span className="font-bold text-green-400">{partners.filter(p => p.status === 'active').length}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Avg Health:</span>
              <span className="font-bold text-blue-400">{Math.round(partners.filter(p => p.status === 'active').reduce((s, p) => s + p.healthScore, 0) / Math.max(partners.filter(p => p.status === 'active').length, 1))}/100</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Expiring:</span>
              <span className="font-bold text-orange-400">{partners.filter(p => p.status === 'active' && p.contractEnd && (new Date(p.contractEnd) - new Date()) / (1000 * 60 * 60 * 24) <= 90 && (new Date(p.contractEnd) - new Date()) / (1000 * 60 * 60 * 24) > 0).length}</span>
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
  const data = useData();
  const vendors = data?.vendors || DEFAULT_VENDORS;

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
      result = result.filter(p => p.name.toLowerCase().includes(q) || (vendors.find(v => v.key === p.vendor)?.label || '').toLowerCase().includes(q));
    }
    if (sortField === 'tier') result = [...result].sort((a, b) => getTier(a) - getTier(b) || (b.share || 0) - (a.share || 0));
    else if (sortField === 'share') result = [...result].sort((a, b) => (b.share || 0) - (a.share || 0));
    else if (sortField === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortField === 'pricing') result = [...result].sort((a, b) => (b.pricing || 0) - (a.pricing || 0));
    return result;
  }, [baseProducts, selectedCategories, selectedVendors, selectedSampleTypes, selectedNucleicAcids, searchText, sortField]);

  const availableVendors = useMemo(() => {
    const vKeys = [...new Set(baseProducts.filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category)).map(p => p.vendor))];
    return vendors.filter(v => vKeys.includes(v.key)).sort((a, b) => a.label.localeCompare(b.label));
  }, [baseProducts, selectedCategories, vendors]);

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
                const v = vendors.find(v => v.key === p.vendor);
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
  const data = useData();
  const vendors = data?.vendors || DEFAULT_VENDORS;
  const financials = data?.financials || DEFAULT_FINANCIALS;

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [sortField, setSortField] = useState('share');
  const [selectedFinancialVendor, setSelectedFinancialVendor] = useState('illumina');

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
    return vendors.map(vendor => {
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
  }, [filteredProducts, searchText, sortField, vendors]);

  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  // Library Prep competitive data for Archer/IDT perspective
  const libPrepProducts = useMemo(() => {
    return products.filter(p => p.category === 'Library Prep' || p.category === 'Diagnostic Services');
  }, [products]);

  const libPrepVendorStats = useMemo(() => {
    const vendorMap = {};
    libPrepProducts.forEach(p => {
      if (!vendorMap[p.vendor]) {
        const v = vendors.find(v => v.key === p.vendor);
        vendorMap[p.vendor] = { key: p.vendor, label: v?.label || p.vendor, color: v?.color || '#6b7280', products: [], totalShare: 0, categories: new Set(), indications: new Set(), regulatoryTypes: new Set(), tiers: { A: 0, B: 0, C: 0 } };
      }
      const entry = vendorMap[p.vendor];
      entry.products.push(p);
      entry.totalShare += (p.share || 0);
      entry.categories.add(p.category);
      (p.indications || []).forEach(i => entry.indications.add(i));
      if (p.regulatory) entry.regulatoryTypes.add(p.regulatory);
      if (p.tier && entry.tiers[p.tier] !== undefined) entry.tiers[p.tier]++;
    });
    return Object.values(vendorMap).sort((a, b) => b.totalShare - a.totalShare);
  }, [libPrepProducts, vendors]);

  // Illumina financial data
  const ilmn = financials?.illumina;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Vendors</h2>
        <span className="text-sm text-gray-400">{vendorStats.length} vendors</span>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
        {[
          { key: 'overview', label: 'Overview', icon: Users },
          { key: 'competitive', label: 'Competitive Landscape', icon: BarChart3 },
          { key: 'financials', label: 'Financial Intel', icon: DollarSign },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === 'overview' && <>

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
      </>}

      {/* ===== COMPETITIVE LANDSCAPE TAB ===== */}
      {activeTab === 'competitive' && <>
        <div className="space-y-5">
          {/* Archer / IDT Context Banner */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-700/40 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Targeted Assay Competitive Landscape</h3>
            </div>
            <p className="text-xs text-gray-300">Library Prep and Diagnostic Services competitive positioning from the Archer (ArcherDX) and IDT perspective. {libPrepVendorStats.length} vendors, {libPrepProducts.length} products tracked.</p>
          </div>

          {/* Market Share by Vendor - Bar Chart */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-bold text-white mb-3">Library Prep + Dx Services Market Share by Vendor</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={libPrepVendorStats.slice(0, 15).map(v => ({ name: v.label.length > 14 ? v.label.substring(0, 14) + '...' : v.label, share: Math.round(v.totalShare * 10) / 10, products: v.products.length, color: v.color }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" width={110} fontSize={10} interval={0} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v) => [`${v}%`, 'Share']} />
                  <Bar dataKey="share" radius={[0, 4, 4, 0]}>
                    {libPrepVendorStats.slice(0, 15).map((v, i) => (
                      <Cell key={v.key} fill={v.key === 'archerdx' || v.key === 'idt' ? '#f59e0b' : v.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Indication Coverage Comparison */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-bold text-white mb-3">Indication Coverage Depth (Products per Indication)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={INDICATIONS.map(ind => {
                  const entry = { indication: ind.label.length > 12 ? ind.label.substring(0, 12) + '...' : ind.label };
                  ['illumina', 'archerdx', 'idt', 'roche', 'thermo', 'agilent', 'twist'].forEach(vk => {
                    const v = vendors.find(v => v.key === vk);
                    entry[v?.label || vk] = libPrepProducts.filter(p => p.vendor === vk && (p.indications || []).includes(ind.key)).length;
                  });
                  return entry;
                })} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="indication" type="category" stroke="#9ca3af" width={100} fontSize={10} interval={0} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  {['illumina', 'archerdx', 'idt', 'roche', 'thermo', 'agilent', 'twist'].map(vk => {
                    const v = vendors.find(v => v.key === vk);
                    return <Bar key={vk} dataKey={v?.label || vk} fill={vk === 'archerdx' ? '#f97316' : vk === 'idt' ? '#a855f7' : v?.color || '#6b7280'} />;
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Head-to-Head Comparison Table */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-3">Head-to-Head: Product Comparison Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-3 py-2 text-left text-gray-400 font-medium">Vendor</th>
                    <th className="px-3 py-2 text-left text-gray-400 font-medium">Products</th>
                    <th className="px-3 py-2 text-left text-gray-400 font-medium">Combined Share</th>
                    <th className="px-3 py-2 text-left text-gray-400 font-medium">Tier A</th>
                    <th className="px-3 py-2 text-left text-gray-400 font-medium">Avg Price</th>
                    <th className="px-3 py-2 text-left text-gray-400 font-medium">Regulatory</th>
                    <th className="px-3 py-2 text-left text-gray-400 font-medium">Indications</th>
                    <th className="px-3 py-2 text-left text-gray-400 font-medium">Growth Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {libPrepVendorStats.map((v, i) => {
                    const avgPrice = v.products.length > 0 ? Math.round(v.products.reduce((s, p) => s + (p.pricing || 0), 0) / v.products.length) : 0;
                    const growthCounts = {};
                    v.products.forEach(p => { growthCounts[p.growth || 'unknown'] = (growthCounts[p.growth || 'unknown'] || 0) + 1; });
                    const topGrowth = Object.entries(growthCounts).sort((a, b) => b[1] - a[1])[0];
                    const isHighlighted = v.key === 'archerdx' || v.key === 'idt';
                    return (
                      <tr key={v.key} className={`border-b border-gray-700/50 ${isHighlighted ? 'bg-amber-900/20' : i % 2 === 0 ? '' : 'bg-gray-900/30'} hover:bg-gray-700/30`}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }}></div>
                            <span className={`font-medium ${isHighlighted ? 'text-amber-300' : 'text-white'}`}>{v.label}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-300 font-mono">{v.products.length}</td>
                        <td className="px-3 py-2 text-white font-mono font-bold">{Math.round(v.totalShare * 10) / 10}%</td>
                        <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${v.tiers.A > 0 ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-500'}`}>{v.tiers.A}</span></td>
                        <td className="px-3 py-2 text-gray-300 font-mono">{avgPrice > 500 ? 'Service' : `$${avgPrice}`}</td>
                        <td className="px-3 py-2"><div className="flex gap-1 flex-wrap">{[...v.regulatoryTypes].map(r => <span key={r} className={`px-1 py-0.5 rounded text-xs ${getRegulatoryBadge(r)}`}>{r}</span>)}</div></td>
                        <td className="px-3 py-2 text-gray-400">{v.indications.size}</td>
                        <td className="px-3 py-2">{topGrowth && <span className={`text-xs ${topGrowth[0] === 'growing' || topGrowth[0] === 'emerging' ? 'text-green-400' : topGrowth[0] === 'declining' ? 'text-red-400' : 'text-gray-400'}`}>{topGrowth[0]} ({topGrowth[1]})</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Archer & IDT Spotlight */}
          <div className="grid grid-cols-2 gap-4">
            {['archerdx', 'idt'].map(vk => {
              const vData = libPrepVendorStats.find(v => v.key === vk);
              const vInfo = vendors.find(v => v.key === vk);
              if (!vData) return null;
              return (
                <div key={vk} className="bg-gray-800 rounded-lg p-4 border border-amber-700/40">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (vInfo?.color || '#f59e0b') + '30' }}>
                      <span className="text-sm font-bold" style={{ color: vInfo?.color || '#f59e0b' }}>{vInfo?.label?.charAt(0) || vk.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{vInfo?.label || vk}</h4>
                      <p className="text-xs text-gray-400">{vData.products.length} products, {Math.round(vData.totalShare * 10) / 10}% combined share</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {vData.products.sort((a, b) => (b.share || 0) - (a.share || 0)).map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-gray-900/50 rounded px-3 py-2">
                        <div>
                          <span className="text-xs text-white font-medium">{p.name}</span>
                          <div className="flex gap-1 mt-0.5">
                            <span className={`px-1 py-0 rounded text-xs ${getRegulatoryBadge(p.regulatory)}`}>{p.regulatory}</span>
                            <span className={`px-1 py-0 rounded text-xs ${p.tier === 'A' ? 'bg-green-900/50 text-green-300' : p.tier === 'B' ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>Tier {p.tier}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-white font-mono font-bold">{p.share}%</span>
                          <div className="text-xs text-gray-400">${p.pricing}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {vInfo && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-green-400 mb-1"><span className="font-semibold">Strength:</span> {vInfo.strength}</p>
                      <p className="text-xs text-red-400 mb-1"><span className="font-semibold">Weakness:</span> {vInfo.weakness}</p>
                      <p className="text-xs text-blue-400"><span className="font-semibold">Recent:</span> {vInfo.recentMove}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </>}

      {/* ===== FINANCIAL INTEL TAB ===== */}
      {activeTab === 'financials' && <>
        <div className="space-y-5">
          {/* Vendor Selector */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="text-xs font-semibold text-gray-400 block mb-2">Select Vendor for Detail View</label>
            <select
              value={selectedFinancialVendor}
              onChange={(e) => setSelectedFinancialVendor(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {Object.entries(financials).map(([key, data]) => (
                <option key={key} value={key}>{data.ticker} - {vendors.find(v => v.key === key)?.label || key}</option>
              ))}
            </select>
          </div>

          {/* Comparison Overview Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white">Financial Comparison - All Public Vendors</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-gray-300">
                <thead className="bg-gray-900 border-b border-gray-700 sticky top-0">
                  <tr>
                    {['Vendor', 'Ticker', 'Revenue ($M)', 'Growth %', 'Gross Margin', 'Op Margin', 'R&D %', 'Cash ($M)', 'Debt ($M)', 'Market Cap ($M)', 'Profitable', 'Filing Date'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-gray-400 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(financials).sort((a, b) => b[1].revenue - a[1].revenue).map(([key, f]) => (
                    <tr
                      key={key}
                      className={`border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${selectedFinancialVendor === key ? 'bg-blue-900/30' : ''}`}
                      onClick={() => setSelectedFinancialVendor(key)}
                    >
                      <td className="px-3 py-2 font-medium text-white">{vendors.find(v => v.key === key)?.label || key}</td>
                      <td className="px-3 py-2 text-gray-400 font-mono">{f.ticker}</td>
                      <td className="px-3 py-2 text-blue-400 font-mono">${f.revenue?.toLocaleString() || 'N/A'}</td>
                      <td className={`px-3 py-2 font-mono ${f.revenueGrowth > 0 ? 'text-green-400' : f.revenueGrowth < 0 ? 'text-red-400' : 'text-gray-400'}`}>{f.revenueGrowth ? `${(f.revenueGrowth * 100).toFixed(1)}%` : 'N/A'}</td>
                      <td className="px-3 py-2 font-mono">{f.grossMargin ? `${(f.grossMargin * 100).toFixed(1)}%` : 'N/A'}</td>
                      <td className="px-3 py-2 font-mono">{f.opMargin ? `${(f.opMargin * 100).toFixed(1)}%` : 'N/A'}</td>
                      <td className="px-3 py-2 font-mono">{f.rdPct ? `${(f.rdPct * 100).toFixed(1)}%` : 'N/A'}</td>
                      <td className="px-3 py-2 text-green-400 font-mono">${f.cash?.toLocaleString() || 'N/A'}</td>
                      <td className="px-3 py-2 text-red-400 font-mono">${f.totalDebt?.toLocaleString() || 'N/A'}</td>
                      <td className="px-3 py-2 text-yellow-400 font-mono">${f.marketCap?.toLocaleString() || 'N/A'}</td>
                      <td className="px-3 py-2">{f.profitable ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}</td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{f.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue & Growth Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-bold text-white mb-3">Revenue by Vendor (Horizontal Bar)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(financials).sort((a, b) => b[1].revenue - a[1].revenue).map(([key, f]) => ({
                    vendor: vendors.find(v => v.key === key)?.label || key,
                    revenue: f.revenue,
                    color: vendors.find(v => v.key === key)?.color || '#6b7280'
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="vendor" type="category" stroke="#9ca3af" fontSize={10} width={115} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v) => `$${v}M`} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-bold text-white mb-3">Growth vs Margin Scatter</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="growth" name="Revenue Growth %" stroke="#9ca3af" fontSize={11} />
                  <YAxis dataKey="margin" name="Gross Margin %" stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(v, name, props) => {
                      if (name === 'growth') return `${(v * 100).toFixed(1)}%`;
                      if (name === 'margin') return `${(v * 100).toFixed(1)}%`;
                      return v;
                    }}
                    labelFormatter={(label) => ''}
                  />
                  <Scatter
                    name="Vendors"
                    data={Object.entries(financials).map(([key, f]) => ({
                      growth: f.revenueGrowth || 0,
                      margin: f.grossMargin || 0,
                      size: (f.revenue || 0) / 50,
                      name: vendors.find(v => v.key === key)?.label || key,
                      color: vendors.find(v => v.key === key)?.color || '#6b7280'
                    }))}
                    fill="#3b82f6"
                  >
                    {Object.entries(financials).map(([key, f]) => (
                      <Cell key={key} fill={vendors.find(v => v.key === key)?.color || '#6b7280'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected Vendor Detail Section */}
          {financials[selectedFinancialVendor] && (() => {
            const f = financials[selectedFinancialVendor];
            const vendor = vendors.find(v => v.key === selectedFinancialVendor);
            const netPosition = (f.cash || 0) - (f.totalDebt || 0);
            return (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: vendor?.color || '#6b7280' }}></div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{vendor?.label}</h3>
                        <p className="text-xs text-gray-400">{f.ticker} | {f.lastFY} | Filed {f.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-xs text-gray-400">Revenue</p>
                        <p className="text-2xl font-bold text-blue-400 font-mono">${f.revenue?.toLocaleString()}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Growth YoY</p>
                        <p className={`text-2xl font-bold font-mono ${f.revenueGrowth > 0 ? 'text-green-400' : f.revenueGrowth < 0 ? 'text-red-400' : 'text-gray-400'}`}>{f.revenueGrowth ? `${(f.revenueGrowth * 100).toFixed(1)}%` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Market Cap</p>
                        <p className="text-2xl font-bold text-yellow-400 font-mono">${f.marketCap?.toLocaleString()}M</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quarterly Revenue Bar Chart */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-bold text-white mb-3">Quarterly Revenue ($M)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={f.quarterly || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="quarter" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v) => `$${v}M`} />
                      <Bar dataKey="revenue" fill={vendor?.color || '#3b82f6'} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Revenue + Growth</p>
                    <p className="text-xl font-bold text-blue-400 font-mono">${f.revenue?.toLocaleString()}M</p>
                    <p className={`text-xs font-mono mt-1 ${f.revenueGrowth > 0 ? 'text-green-400' : f.revenueGrowth < 0 ? 'text-red-400' : 'text-gray-400'}`}>{f.revenueGrowth ? `${(f.revenueGrowth * 100).toFixed(1)}%` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Gross Margin + Op Margin</p>
                    <p className="text-xl font-bold text-green-400 font-mono">{f.grossMargin ? `${(f.grossMargin * 100).toFixed(1)}%` : 'N/A'}</p>
                    <p className="text-xs text-amber-400 mt-1 font-mono">{f.opMargin ? `Op: ${(f.opMargin * 100).toFixed(1)}%` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">R&D Spend + % Revenue</p>
                    <p className="text-xl font-bold text-purple-400 font-mono">${f.rdSpend?.toLocaleString()}M</p>
                    <p className="text-xs text-purple-300 mt-1 font-mono">{f.rdPct ? `${(f.rdPct * 100).toFixed(1)}%` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Cash - Debt = Net</p>
                    <p className={`text-xl font-bold font-mono ${netPosition > 0 ? 'text-green-400' : 'text-red-400'}`}>${netPosition?.toLocaleString()}M</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{f.cash}C / {f.totalDebt}D</p>
                  </div>
                </div>

                {/* Balance Sheet Summary */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-bold text-white mb-3">Balance Sheet Summary</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Assets & Liabilities</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Total Assets</span><span className="text-blue-400 font-mono">${f.balanceSheet?.totalAssets?.toLocaleString()}M</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Total Liabilities</span><span className="text-red-400 font-mono">${f.balanceSheet?.totalLiabilities?.toLocaleString()}M</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Equity</span><span className="text-green-400 font-mono">${f.balanceSheet?.equity?.toLocaleString()}M</span></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Cash Position</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Cash</span><span className="text-green-400 font-mono">${f.cash?.toLocaleString()}M</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Total Debt</span><span className="text-red-400 font-mono">${f.totalDebt?.toLocaleString()}M</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Net Position</span><span className={netPosition > 0 ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>${netPosition?.toLocaleString()}M</span></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Profitability & EPS</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Profitable</span><span className="text-gray-300">{f.profitable ? <CheckCircle className="w-4 h-4 text-green-400 inline" /> : <AlertCircle className="w-4 h-4 text-red-400 inline" />}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">EPS (Non-GAAP)</span><span className="text-amber-400 font-mono">${f.epsNonGaap?.toFixed(2) || 'N/A'}</span></div>
                        <div className="text-xs text-gray-500 mt-2">Market cap reflects public pricing</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guidance & Commentary */}
                {(f.guidanceRevenue || f.guidanceEps || f.keyCommentary) && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-sm font-bold text-white mb-3">Forward Guidance & Key Commentary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold mb-2">Forward Guidance</p>
                        {f.guidanceRevenue && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-300">Revenue Range</p>
                            <p className="text-sm font-mono text-blue-400">${f.guidanceRevenue[0]}-${f.guidanceRevenue[1]}M</p>
                          </div>
                        )}
                        {f.guidanceEps && (
                          <div>
                            <p className="text-xs text-gray-300">EPS Range</p>
                            <p className="text-sm font-mono text-amber-400">${f.guidanceEps[0]}-${f.guidanceEps[1]}</p>
                          </div>
                        )}
                        {!f.guidanceRevenue && !f.guidanceEps && <p className="text-xs text-gray-500">No specific guidance provided</p>}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold mb-2">Key Commentary</p>
                        <p className="text-xs text-gray-300 leading-relaxed">{f.keyCommentary || 'No commentary available'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Source */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                  <p className="text-xs text-gray-500">Source: {f.filingSource} | Last Updated: {f.lastUpdated}</p>
                  <p className="text-xs text-gray-600 mt-1">All figures in USD millions. Non-GAAP metrics exclude stock-based compensation and amortization of acquired intangibles.</p>
                </div>
              </>
            );
          })()}
        </div>
      </>}
    </div>
  );
};

const CompareView = ({ products, indicationFilter }) => {
  const data = useData();
  const vendors = data?.vendors || DEFAULT_VENDORS;

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
    return vendors.filter(v => vKeys.includes(v.key)).sort((a, b) => a.label.localeCompare(b.label));
  }, [allProducts, vendors]);

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
      const v = vendors.find(v => v.key === p.vendor);
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
                  const v = vendors.find(v => v.key === p.vendor);
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
                { region: 'North America', ...Object.fromEntries(vendorChartData.slice(0, 6).map(v => [v.vendor, filteredProducts.filter(p => vendors.find(vv => vv.key === p.vendor)?.label === v.vendor).reduce((s, p) => s + (p.regionalShare?.na || 0), 0)])) },
                { region: 'W. Europe', ...Object.fromEntries(vendorChartData.slice(0, 6).map(v => [v.vendor, filteredProducts.filter(p => vendors.find(vv => vv.key === p.vendor)?.label === v.vendor).reduce((s, p) => s + (p.regionalShare?.we || 0), 0)])) },
                { region: 'High-Growth', ...Object.fromEntries(vendorChartData.slice(0, 6).map(v => [v.vendor, filteredProducts.filter(p => vendors.find(vv => vv.key === p.vendor)?.label === v.vendor).reduce((s, p) => s + (p.regionalShare?.hg || 0), 0)])) },
                { region: 'Other Dev.', ...Object.fromEntries(vendorChartData.slice(0, 6).map(v => [v.vendor, filteredProducts.filter(p => vendors.find(vv => vv.key === p.vendor)?.label === v.vendor).reduce((s, p) => s + (p.regionalShare?.od || 0), 0)])) },
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
                const v = vendors.find(v => v.key === p.vendor);
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
  const data = useData();
  const timelineEvents = data?.timelineEvents || DEFAULT_TIMELINE_EVENTS;

  return (
    <div className="space-y-3">
      {timelineEvents.map((event, i) => (
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
  const data = useData();
  const compatibilityLayers = data?.compatibilityLayers || DEFAULT_COMPATIBILITY_LAYERS;
  const compatibility = data?.compatibility || DEFAULT_COMPATIBILITY;
  const vendors = data?.vendors || DEFAULT_VENDORS;

  const [selectedLayer, setSelectedLayer] = useState('ext_to_libprep');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'builder'
  const [hoveredCell, setHoveredCell] = useState(null);

  const currentLayer = compatibilityLayers.find(l => l.key === selectedLayer);
  const layerData = useMemo(() => compatibility.filter(c => c.layer === selectedLayer), [selectedLayer, compatibility]);

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
    compatibility.forEach(c => { counts[c.level] = (counts[c.level] || 0) + 1; counts.total++; });
    return counts;
  }, [compatibility]);

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
  const getVendor = (id) => { const p = getProduct(id); return p ? vendors.find(v => v.key === p.vendor) : null; };

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
          <p className="text-xl font-bold text-blue-400">{compatibilityLayers.length}</p>
        </div>
      </div>

      {/* Layer tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1 overflow-x-auto">
        {compatibilityLayers.map(layer => {
          const layerCount = compatibility.filter(c => c.layer === layer.key).length;
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
  const data = useData();
  const compatibility = data?.compatibility || DEFAULT_COMPATIBILITY;
  const costComponents = data?.costComponents || DEFAULT_COST_COMPONENTS;

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

    const compatibleIds = compatibility
      .filter(c => c.source === prevSelectedId && c.level !== 'theoretical')
      .map(c => c.target);

    return categoryProducts.filter(p => compatibleIds.includes(p.id));
  };

  const getTotalCost = () => {
    let total = 0;
    Object.entries(workflow).forEach(([key, productId]) => {
      if (productId && costComponents[productId]) {
        total += costComponents[productId].total;
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
    if (productId && costComponents[productId]) {
      costBreakdown[key] = costComponents[productId];
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
  const data = useData();
  const marketSize = data?.marketSize || DEFAULT_MARKET_SIZE;
  const vendors = data?.vendors || DEFAULT_VENDORS;

  const [selectedIndication, setSelectedIndication] = useState('solid_tumor');

  const indication = INDICATIONS.find(i => i.key === selectedIndication);
  const indicationProducts = products.filter(p => p.indications?.includes(selectedIndication));
  const indicationTAM = marketSize.byIndication[selectedIndication] || 5000;

  const topVendorsInIndication = useMemo(() => {
    const vendorShare = {};
    indicationProducts.forEach(p => {
      vendorShare[p.vendor] = (vendorShare[p.vendor] || 0) + (p.share || 0);
    });
    return Object.entries(vendorShare).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([v, s]) => ({
      vendor: vendors.find(vnd => vnd.key === v)?.label || v,
      share: s,
    }));
  }, [indicationProducts, vendors]);

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
              NA: ${(indicationTAM * marketSize.byRegion.na).toFixed(0)}M |
              WE: ${(indicationTAM * marketSize.byRegion.we).toFixed(0)}M |
              HG: ${(indicationTAM * marketSize.byRegion.hg).toFixed(0)}M
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
              <div className="text-xs text-gray-400 mb-2">{vendors.find(v => v.key === p.vendor)?.label}</div>
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
  const data = useData();
  const intelSignals = data?.intelSignals || DEFAULT_INTEL_SIGNALS;
  const vendors = data?.vendors || DEFAULT_VENDORS;

  const [filterType, setFilterType] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterImpact, setFilterImpact] = useState('');

  const filteredSignals = useMemo(() => {
    return intelSignals.filter(signal => {
      return (!filterType || signal.type === filterType) &&
             (!filterVendor || signal.vendor === filterVendor) &&
             (!filterImpact || signal.impact === filterImpact);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filterType, filterVendor, filterImpact, intelSignals]);

  const highImpactSignals = intelSignals.filter(s => s.impact === 'high').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  const signalsByType = useMemo(() => {
    const types = {};
    intelSignals.forEach(s => {
      types[s.type] = (types[s.type] || 0) + 1;
    });
    return Object.entries(types).map(([k, v]) => ({ name: k, value: v }));
  }, [intelSignals]);

  const signalsByVendor = useMemo(() => {
    const vendorCounts = {};
    intelSignals.forEach(s => {
      vendorCounts[s.vendor] = (vendorCounts[s.vendor] || 0) + 1;
    });
    return Object.entries(vendorCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ name: vendors.find(vnd => vnd.key === k)?.label || k, value: v }));
  }, [intelSignals, vendors]);

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
              {[...new Set(intelSignals.map(s => s.vendor))].map(v => (
                <option key={v} value={v}>{vendors.find(vnd => vnd.key === v)?.label || v}</option>
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

  // Editable data state
  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [timelineEvents, setTimelineEvents] = useState(DEFAULT_TIMELINE_EVENTS);
  const [compatibility, setCompatibility] = useState(DEFAULT_COMPATIBILITY);
  const [compatibilityLayers, setCompatibilityLayers] = useState(DEFAULT_COMPATIBILITY_LAYERS);
  const [historicalSnapshots, setHistoricalSnapshots] = useState(DEFAULT_HISTORICAL_SNAPSHOTS);
  const [marketSize, setMarketSize] = useState(DEFAULT_MARKET_SIZE);
  const [intelSignals, setIntelSignals] = useState(DEFAULT_INTEL_SIGNALS);
  const [costComponents, setCostComponents] = useState(DEFAULT_COST_COMPONENTS);
  const [partners, setPartners] = useState(DEFAULT_PARTNERS);
  const [financials, setFinancials] = useState(DEFAULT_FINANCIALS);

  const dataContextValue = useMemo(() => ({
    vendors, setVendors,
    products, setProducts,
    timelineEvents, setTimelineEvents,
    compatibility, setCompatibility,
    compatibilityLayers, setCompatibilityLayers,
    historicalSnapshots, setHistoricalSnapshots,
    marketSize, setMarketSize,
    intelSignals, setIntelSignals,
    costComponents, setCostComponents,
    partners, setPartners,
    financials, setFinancials,
  }), [vendors, products, timelineEvents, compatibility, compatibilityLayers, historicalSnapshots, marketSize, intelSignals, costComponents, partners, financials]);

  const filteredProducts = useMemo(() => {
    return indicationFilter.length > 0
      ? products.filter(p => p.indications?.some(ind => indicationFilter.includes(ind)))
      : products;
  }, [indicationFilter, products]);

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
      case 'partners':
        return <PartnersView products={filteredProducts} indicationFilter={indicationFilter} />;
      case 'validation':
        return <ValidationView products={filteredProducts} />;
      case 'admin':
        return <AdminView />;
      default:
        return null;
    }
  };

  return (
    <DataContext.Provider value={dataContextValue}>
      <ScenarioContext.Provider value={{ adjustments, setAdjustments }}>
        <div className="flex min-h-screen bg-gray-950 text-white">
          <Sidebar activeView={activeView} setActiveView={setActiveView} indicationFilter={indicationFilter} />
          <main className="flex-1 p-8 overflow-auto">
            <IndicationFilterBar indicationFilter={indicationFilter} setIndicationFilter={setIndicationFilter} />
            {renderView()}
          </main>
        </div>
      </ScenarioContext.Provider>
    </DataContext.Provider>
  );
}
