import mongoose from "mongoose";

import { env } from "../config/env.js";
import { defaultInstituteSettings, runtimeInstituteSettings } from "../data/defaultCatalog.js";
import InstituteSettings from "../models/InstituteSettings.js";

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const defaultConfig = defaultInstituteSettings.whatsappConfig;

const mergeWhatsAppConfig = (settings = {}) => {
  const runtimeConfig = runtimeInstituteSettings.whatsappConfig || defaultConfig;
  const source = settings?.whatsappConfig || settings || {};

  return {
    apiUrl: String(
      source.apiUrl || runtimeConfig.apiUrl || env.whatsappApiUrl || defaultConfig.apiUrl || "",
    ).trim(),
    apiKey: String(source.apiKey || runtimeConfig.apiKey || env.whatsappApiKey || "").trim(),
    phoneNumber: String(
      source.phoneNumber || runtimeConfig.phoneNumber || env.whatsappPhoneNumber || defaultConfig.phoneNumber,
    ).trim(),
    automationEnabled:
      source.automationEnabled === undefined
        ? runtimeConfig.automationEnabled ?? defaultConfig.automationEnabled
        : Boolean(source.automationEnabled),
    botEnabled:
      source.botEnabled === undefined
        ? runtimeConfig.botEnabled ?? defaultConfig.botEnabled
        : Boolean(source.botEnabled),
    botReplyDelaySeconds: Math.min(
      600,
      Math.max(
        5,
        Number(
          source.botReplyDelaySeconds ??
            runtimeConfig.botReplyDelaySeconds ??
            defaultConfig.botReplyDelaySeconds,
        ) || defaultConfig.botReplyDelaySeconds,
      ),
    ),
    autoReplies: {
      fees:
        source.autoReplies?.fees ||
        runtimeConfig.autoReplies?.fees ||
        defaultConfig.autoReplies.fees,
      course:
        source.autoReplies?.course ||
        runtimeConfig.autoReplies?.course ||
        defaultConfig.autoReplies.course,
      job:
        source.autoReplies?.job ||
        runtimeConfig.autoReplies?.job ||
        defaultConfig.autoReplies.job,
      duration:
        source.autoReplies?.duration ||
        runtimeConfig.autoReplies?.duration ||
        defaultConfig.autoReplies.duration,
      tenthSuggestion:
        source.autoReplies?.tenthSuggestion ||
        runtimeConfig.autoReplies?.tenthSuggestion ||
        defaultConfig.autoReplies.tenthSuggestion,
      twelfthSuggestion:
        source.autoReplies?.twelfthSuggestion ||
        runtimeConfig.autoReplies?.twelfthSuggestion ||
        defaultConfig.autoReplies.twelfthSuggestion,
      graduateSuggestion:
        source.autoReplies?.graduateSuggestion ||
        runtimeConfig.autoReplies?.graduateSuggestion ||
        defaultConfig.autoReplies.graduateSuggestion,
    },
    templates: {
      paymentReceived:
        source.templates?.paymentReceived ||
        runtimeConfig.templates?.paymentReceived ||
        defaultConfig.templates.paymentReceived,
      enquiryReply:
        source.templates?.enquiryReply ||
        runtimeConfig.templates?.enquiryReply ||
        defaultConfig.templates.enquiryReply,
    },
  };
};

export const normalizeWhatsAppSettings = (settings = {}) => {
  const mergedConfig = mergeWhatsAppConfig(settings);

  return {
    apiUrl: mergedConfig.apiUrl,
    apiKey: "",
    phoneNumber: mergedConfig.phoneNumber,
    automationEnabled: mergedConfig.automationEnabled,
    botEnabled: mergedConfig.botEnabled,
    botReplyDelaySeconds: mergedConfig.botReplyDelaySeconds,
    autoReplies: {
      ...mergedConfig.autoReplies,
    },
    templates: {
      ...mergedConfig.templates,
    },
    apiKeyConfigured: Boolean(mergedConfig.apiKey),
    provider: "Interakt",
  };
};

export const getResolvedWhatsAppSettings = async () => {
  if (isDatabaseReady()) {
    const settings = await InstituteSettings.findOne().lean();
    return mergeWhatsAppConfig(settings || {});
  }

  return mergeWhatsAppConfig(runtimeInstituteSettings);
};

export const getWhatsAppSettings = async () => {
  const settings = await getResolvedWhatsAppSettings();
  return normalizeWhatsAppSettings(settings);
};

export const updateWhatsAppSettings = async (payload) => {
  const current = await getResolvedWhatsAppSettings();
  const nextResolved = mergeWhatsAppConfig({
    whatsappConfig: {
      ...current,
      ...payload,
      apiKey:
        payload.apiKey === undefined
          ? current.apiKey
          : String(payload.apiKey || "").trim() || current.apiKey,
      templates: {
        ...current.templates,
        ...payload.templates,
      },
      autoReplies: {
        ...current.autoReplies,
        ...payload.autoReplies,
      },
    },
  });

  if (isDatabaseReady()) {
    let settings = await InstituteSettings.findOne();

    if (!settings) {
      settings = await InstituteSettings.create({
        ...runtimeInstituteSettings,
        whatsappNumber: nextResolved.phoneNumber,
        whatsappConfig: nextResolved,
      });
    } else {
      settings.whatsappNumber = nextResolved.phoneNumber;
      settings.whatsappConfig = {
        apiUrl: nextResolved.apiUrl,
        apiKey: nextResolved.apiKey,
        phoneNumber: nextResolved.phoneNumber,
        automationEnabled: nextResolved.automationEnabled,
        botEnabled: nextResolved.botEnabled,
        botReplyDelaySeconds: nextResolved.botReplyDelaySeconds,
        autoReplies: nextResolved.autoReplies,
        templates: nextResolved.templates,
      };
      await settings.save();
    }
  } else {
    runtimeInstituteSettings.whatsappNumber = nextResolved.phoneNumber;
    runtimeInstituteSettings.whatsappConfig = {
      apiUrl: nextResolved.apiUrl,
      apiKey: nextResolved.apiKey,
      phoneNumber: nextResolved.phoneNumber,
      automationEnabled: nextResolved.automationEnabled,
      botEnabled: nextResolved.botEnabled,
      botReplyDelaySeconds: nextResolved.botReplyDelaySeconds,
      autoReplies: {
        ...nextResolved.autoReplies,
      },
      templates: {
        ...nextResolved.templates,
      },
    };
  }

  return normalizeWhatsAppSettings(nextResolved);
};
