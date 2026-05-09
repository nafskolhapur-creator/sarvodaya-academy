import mongoose from "mongoose";

const feeReminderConfigSchema = new mongoose.Schema(
  {
    autoRemindersEnabled: {
      type: Boolean,
      default: false,
    },
    dueDay: {
      type: Number,
      default: 10,
      min: 1,
      max: 28,
    },
    reminderDay: {
      type: Number,
      default: 5,
      min: 1,
      max: 28,
    },
    urgentReminderDay: {
      type: Number,
      default: 9,
      min: 1,
      max: 28,
    },
    defaultLateFee: {
      type: Number,
      default: 100,
      min: 0,
    },
    templates: {
      reminder: {
        type: String,
        default:
          "Reminder: Your monthly fee for [Course Name] is pending. Please pay before 10th to avoid late fee.",
      },
      urgent: {
        type: String,
        default: "Urgent: Your fee is still pending. Pay before due date to avoid penalty.",
      },
      late: {
        type: String,
        default: "Your fee is overdue. Late fee has been applied. Kindly pay as soon as possible.",
      },
    },
  },
  {
    _id: false,
  },
);

const whatsappConfigSchema = new mongoose.Schema(
  {
    apiUrl: {
      type: String,
      default: "",
      trim: true,
    },
    apiKey: {
      type: String,
      default: "",
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: "+91-9730848101",
      trim: true,
    },
    automationEnabled: {
      type: Boolean,
      default: true,
    },
    botEnabled: {
      type: Boolean,
      default: true,
    },
    botReplyDelaySeconds: {
      type: Number,
      default: 45,
      min: 5,
      max: 600,
    },
    autoReplies: {
      fees: {
        type: String,
        default:
          "Fees depend on course. Please tell your qualification (10th/12th/Graduate).",
      },
      course: {
        type: String,
        default: "We offer Fire & Safety courses. Please share your qualification.",
      },
      job: {
        type: String,
        default: "Yes, we provide 100% job assistance after course completion.",
      },
      duration: {
        type: String,
        default: "Courses duration ranges from 1 month to 2 years depending on course.",
      },
      tenthSuggestion: {
        type: String,
        default: "Based on your qualification, you can explore these diploma options: [Courses].",
      },
      twelfthSuggestion: {
        type: String,
        default:
          "Based on your qualification, you can explore these advanced diploma options: [Courses].",
      },
      graduateSuggestion: {
        type: String,
        default:
          "For graduates, we recommend PG Diploma and advanced safety pathways. Our team will guide you for the best option.",
      },
    },
    templates: {
      paymentReceived: {
        type: String,
        default: "Payment received successfully. Your receipt is attached.",
      },
      enquiryReply: {
        type: String,
        default:
          "Hello, thank you for your enquiry at Sarvodaya Academy. Our team will guide you for the best Fire and Safety course options.",
      },
    },
  },
  {
    _id: false,
  },
);

const instituteSettingsSchema = new mongoose.Schema(
  {
    instituteName: {
      type: String,
      required: true,
      trim: true,
    },
    instituteSubtitle: {
      type: String,
      trim: true,
    },
    affiliation: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    mapEmbedUrl: {
      type: String,
      default: "",
    },
    whatsappNumber: {
      type: String,
      default: "+91-9730848101",
      trim: true,
    },
    whatsappConfig: {
      type: whatsappConfigSchema,
      default: () => ({}),
    },
    feeReminderConfig: {
      type: feeReminderConfigSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

const InstituteSettings = mongoose.model("InstituteSettings", instituteSettingsSchema);

export default InstituteSettings;
