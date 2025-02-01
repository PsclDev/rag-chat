import type { File, ProcessingStep } from '../../shared/types/file.types';

export const useFilesStore = defineStore("files", () => {
	// State
	const files = ref<File[]>([
		{
			id: 1,
			name: "Financial_Report_2024.pdf",
			type: "pdf",
			size: 1024000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 10,
			priority: "medium",
			tags: ["financial", "report"],
			retryCount: 0,
		},
		{
			id: 2,
			name: "Team_Photo.jpg",
			type: "image",
			size: 2048000,
			status: "processing",
			currentStep: 2,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "image/jpeg",
			extension: ".jpg",
			pageCount: 2,
			priority: "medium",
			tags: ["team", "photo"],
			retryCount: 0,
		},
		{
			id: 3,
			name: "Budget_2024.xlsx",
			type: "spreadsheet",
			size: 512000,
			status: "error",
			currentStep: 3,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType:
				"application/vnd.openxmlformats-officeFile.spreadsheetml.sheet",
			extension: ".xlsx",
			pageCount: 10,
			priority: "high",
			tags: ["budget", "2024"],
			retryCount: 0,
			errorMessage: "Error during processing",
		},
		{
			id: 4,
			name: "Product_Specs.pdf",
			type: "pdf",
			size: 890000,
			status: "pending",
			currentStep: 0,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 5,
			priority: "low",
			tags: ["product", "specs"],
			retryCount: 0,
		},
		{
			id: 5,
			name: "Marketing_Presentation.pdf",
			type: "pdf",
			size: 3145000,
			status: "processing",
			currentStep: 4,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 20,
			priority: "high",
			tags: ["marketing", "presentation"],
			retryCount: 0,
		},
		{
			id: 6,
			name: "Logo_Final.png",
			type: "image",
			size: 458000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "image/png",
			extension: ".png",
			pageCount: 1,
			priority: "medium",
			tags: ["logo", "final"],
			retryCount: 0,
		},
		{
			id: 7,
			name: "Sales_Q1.xlsx",
			type: "spreadsheet",
			size: 892000,
			status: "processing",
			currentStep: 1,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType:
				"application/vnd.openxmlformats-officeFile.spreadsheetml.sheet",
			extension: ".xlsx",
			pageCount: 10,
			priority: "high",
			tags: ["sales", "Q1"],
			retryCount: 0,
		},
		{
			id: 8,
			name: "Contract_Draft.pdf",
			type: "pdf",
			size: 567000,
			status: "error",
			currentStep: 2,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 3,
			priority: "high",
			tags: ["contract", "draft"],
			retryCount: 0,
			errorMessage: "Error during processing",
		},
		{
			id: 9,
			name: "Product_Launch.jpg",
			type: "image",
			size: 1789000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "image/jpeg",
			extension: ".jpg",
			pageCount: 10,
			priority: "medium",
			tags: ["product", "launch"],
			retryCount: 0,
		},
		{
			id: 10,
			name: "Employee_Data.xlsx",
			type: "spreadsheet",
			size: 234000,
			status: "processing",
			currentStep: 3,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType:
				"application/vnd.openxmlformats-officeFile.spreadsheetml.sheet",
			extension: ".xlsx",
			pageCount: 5,
			priority: "high",
			tags: ["employee", "data"],
			retryCount: 0,
		},
		{
			id: 11,
			name: "Terms_of_Service.pdf",
			type: "pdf",
			size: 445000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 10,
			priority: "medium",
			tags: ["terms", "of", "service"],
			retryCount: 0,
		},
		{
			id: 12,
			name: "Website_Banner.png",
			type: "image",
			size: 2567000,
			status: "processing",
			currentStep: 2,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "image/png",
			extension: ".png",
			pageCount: 1,
			priority: "high",
			tags: ["website", "banner"],
			retryCount: 0,
		},
		{
			id: 13,
			name: "Inventory_2024.xlsx",
			type: "spreadsheet",
			size: 678000,
			status: "error",
			currentStep: 4,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType:
				"application/vnd.openxmlformats-officeFile.spreadsheetml.sheet",
			extension: ".xlsx",
			pageCount: 10,
			priority: "high",
			tags: ["inventory", "2024"],
			retryCount: 0,
			errorMessage: "Error during processing",
		},
		{
			id: 14,
			name: "User_Manual_v2.pdf",
			type: "pdf",
			size: 1234000,
			status: "pending",
			currentStep: 0,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 10,
			priority: "low",
			tags: ["user", "manual", "v2"],
			retryCount: 0,
		},
		{
			id: 15,
			name: "Team_Event.jpg",
			type: "image",
			size: 3456000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "image/jpeg",
			extension: ".jpg",
			pageCount: 20,
			priority: "medium",
			tags: ["team", "event"],
			retryCount: 0,
		},
		{
			id: 16,
			name: "Project_Plan.xlsx",
			type: "spreadsheet",
			size: 567000,
			status: "processing",
			currentStep: 1,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType:
				"application/vnd.openxmlformats-officeFile.spreadsheetml.sheet",
			extension: ".xlsx",
			pageCount: 5,
			priority: "high",
			tags: ["project", "plan"],
			retryCount: 0,
		},
		{
			id: 17,
			name: "Legal_Agreement.pdf",
			type: "pdf",
			size: 890000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 10,
			priority: "high",
			tags: ["legal", "agreement"],
			retryCount: 0,
		},
		{
			id: 18,
			name: "Profile_Photos.zip",
			type: "document",
			size: 4567000,
			status: "error",
			currentStep: 1,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/zip",
			extension: ".zip",
			pageCount: 10,
			priority: "high",
			tags: ["profile", "photos"],
			retryCount: 0,
			errorMessage: "Error during processing",
		},
		{
			id: 19,
			name: "Annual_Report.pdf",
			type: "pdf",
			size: 2345000,
			status: "processing",
			currentStep: 3,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 10,
			priority: "high",
			tags: ["annual", "report"],
			retryCount: 0,
		},
		{
			id: 20,
			name: "Product_Catalog.pdf",
			type: "pdf",
			size: 5678000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 20,
			priority: "medium",
			tags: ["product", "catalog"],
			retryCount: 0,
		},
		{
			id: 21,
			name: "Company_Logo_Dark.png",
			type: "image",
			size: 345000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "image/png",
			extension: ".png",
			pageCount: 1,
			priority: "medium",
			tags: ["company", "logo", "dark"],
			retryCount: 0,
		},
		{
			id: 22,
			name: "Meeting_Minutes.pdf",
			type: "pdf",
			size: 128000,
			status: "pending",
			currentStep: 0,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/pdf",
			extension: ".pdf",
			pageCount: 5,
			priority: "low",
			tags: ["meeting", "minutes"],
			retryCount: 0,
		},
		{
			id: 23,
			name: "Customer_Database.xlsx",
			type: "spreadsheet",
			size: 1567000,
			status: "processing",
			currentStep: 2,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType:
				"application/vnd.openxmlformats-officeFile.spreadsheetml.sheet",
			extension: ".xlsx",
			pageCount: 10,
			priority: "high",
			tags: ["customer", "database"],
			retryCount: 0,
		},
		{
			id: 24,
			name: "Backup_Archive.zip",
			type: "document",
			size: 15678000,
			status: "error",
			currentStep: 3,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "application/zip",
			extension: ".zip",
			pageCount: 10,
			priority: "high",
			tags: ["backup", "archive"],
			retryCount: 0,
			errorMessage: "Error during processing",
		},
		{
			id: 25,
			name: "Product_Photos_HD.jpg",
			type: "image",
			size: 4567000,
			status: "completed",
			currentStep: 5,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "image/jpeg",
			extension: ".jpg",
			pageCount: 20,
			priority: "high",
			tags: ["product", "photos", "HD"],
			retryCount: 0,
		},
	]);

	const processingSteps = ref<ProcessingStep[]>([
		{ id: "fileCheck", label: "Checking file type" },
		{ id: "quickExtract", label: "Quick extraction" },
		{ id: "metadata", label: "Extracting metadata" },
		{ id: "hdExtract", label: "HD extraction" },
		{ id: "cleanup", label: "Cleaning up" },
	]);

	// Getters
	const getFilteredFiles = computed(() => {
		return (query: string, statusFilter: string) => {
			let filtered = files.value;

			// Apply search filter
			if (query) {
				const lowercaseQuery = query.toLowerCase().trim();
				filtered = filtered.filter((file) =>
					file.name.toLowerCase().includes(lowercaseQuery)
				);
			}

			// Apply status filter
			if (statusFilter !== "all") {
				filtered = filtered.filter((file) => file.status === statusFilter);
			}

			return filtered;
		};
	});

	const getStatusCount = computed(() => {
		return (status: string) => {
			if (status === "all") return files.value.length;
			return files.value.filter((file) => file.status === status).length;
		};
	});

	const getFileIcon = computed(() => {
		return (type: File["type"]): string => {
			switch (type) {
				case "pdf":
					return "i-heroicons-document-text";
				case "image":
					return "i-heroicons-photo";
				case "spreadsheet":
					return "i-heroicons-table-cells";
				default:
					return "i-heroicons-document";
			}
		};
	});

	// Actions
	function addFile(
		doc: Omit<
			File,
			| "id"
			| "status"
			| "currentStep"
			| "createdAt"
			| "lastModified"
			| "mimeType"
			| "extension"
			| "pageCount"
			| "priority"
			| "tags"
			| "retryCount"
			| "errorMessage"
		>
	) {
		const newDoc: File = {
			...doc,
			id: Date.now(),
			status: "processing",
			currentStep: 0,
			createdAt: new Date(),
			lastModified: new Date(),
			mimeType: "",
			extension: "",
			pageCount: undefined,
			priority: "medium",
			tags: [],
			retryCount: 0,
		};
		files.value.push(newDoc);
		simulateProcessing(newDoc);
		return newDoc;
	}

	function deleteFile(id: number) {
		const index = files.value.findIndex((f) => f.id === id);
		if (index !== -1) {
			files.value.splice(index, 1);
		}
	}

	function reprocessFile(id: number) {
		const file = files.value.find((f) => f.id === id);
		if (file) {
			file.status = "processing";
			file.currentStep = 0;
			simulateProcessing(file);
		}
	}

	function simulateProcessing(file: File) {
		const processStep = () => {
			if (file.currentStep < processingSteps.value.length) {
				file.currentStep++;
				const shouldError = Math.random() > 0.9; // 10% chance of error
				if (shouldError) {
					file.status = "error";
					return;
				}
				setTimeout(processStep, 1000 + Math.random() * 2000);
			} else {
				file.status = "completed";
			}
		};
		setTimeout(processStep, 1000);
	}

	function getStepClass(file: File, stepIndex: number) {
		if (file.status === "error") {
			return stepIndex <= file.currentStep ? "bg-red-500" : "bg-slate-700";
		}
		if (file.status === "completed") {
			return "bg-emerald-400";
		}
		if (file.status === "processing") {
			if (stepIndex < file.currentStep) return "bg-emerald-400";
			if (stepIndex === file.currentStep) return "bg-yellow-400";
			return "bg-slate-700";
		}
		return "bg-slate-700";
	}

	function getCurrentStepLabel(doc: File) {
		if (doc.status === "error") return "Error during processing";
		if (doc.status === "completed") return "Processing completed";
		if (
			doc.status === "processing" &&
			doc.currentStep < processingSteps.value.length
		) {
			return processingSteps.value[doc.currentStep].label;
		}
		return "Waiting to start";
	}

	return {
		// State
		files,
		processingSteps,
		// Getters
		getFilteredFiles,
		getStatusCount,
		getFileIcon,
		// Actions
		addFile,
		deleteFile,
		reprocessFile,
		getStepClass,
		getCurrentStepLabel,
	};
});
