import mongoose from "mongoose";

import { defaultInstituteSettings, runtimeInstituteSettings } from "../data/defaultCatalog.js";
import InstituteSettings from "../models/InstituteSettings.js";
import { buildFileUrl } from "../utils/upload.js";
import { isValidUrl, sanitizeText } from "../utils/validation.js";

const buildPublicSettings = (settings) => ({
  instituteName: settings.instituteName,
  instituteSubtitle: settings.instituteSubtitle,
  affiliation: settings.affiliation,
  logoUrl: settings.logoUrl,
  websiteBannerUrl: settings.websiteBannerUrl,
  contactEmail: settings.contactEmail,
  contactPhone: settings.contactPhone,
  address: settings.address,
  mapEmbedUrl: settings.mapEmbedUrl,
  whatsappNumber: settings.whatsappNumber,
  heroDescription: defaultInstituteSettings.heroDescription,
});

const isDatabaseReady = () => mongoose.connection.readyState === 1;

export const getSettings = async (_req, res) => {
  if (isDatabaseReady()) {
    const settings = await InstituteSettings.findOne().lean();

    if (settings) {
      return res.json({
        success: true,
        settings: buildPublicSettings(settings),
      });
    }
  }

  return res.json({
    success: true,
    settings: buildPublicSettings(runtimeInstituteSettings),
  });
};

export const updateSettings = async (req, res) => {
  const logoUpload = req.files?.logo?.[0];
  const bannerUpload = req.files?.banner?.[0];
  const nextSettings = {
    instituteName: sanitizeText(req.body.instituteName) || defaultInstituteSettings.instituteName,
    instituteSubtitle: sanitizeText(req.body.instituteSubtitle),
    affiliation: sanitizeText(req.body.affiliation),
    logoUrl: sanitizeText(req.body.logoUrl),
    websiteBannerUrl: sanitizeText(req.body.websiteBannerUrl),
    contactEmail: sanitizeText(req.body.contactEmail),
    contactPhone: sanitizeText(req.body.contactPhone),
    address: sanitizeText(req.body.address),
    mapEmbedUrl: sanitizeText(req.body.mapEmbedUrl),
  };

  if (nextSettings.mapEmbedUrl && !isValidUrl(nextSettings.mapEmbedUrl)) {
    return res.status(400).json({
      success: false,
      message: "Map URL must be a valid http or https link.",
    });
  }

  if (nextSettings.logoUrl && !logoUpload && !isValidUrl(nextSettings.logoUrl)) {
    return res.status(400).json({
      success: false,
      message: "Logo URL must be a valid http or https link.",
    });
  }

  if (nextSettings.websiteBannerUrl && !bannerUpload && !isValidUrl(nextSettings.websiteBannerUrl)) {
    return res.status(400).json({
      success: false,
      message: "Banner URL must be a valid http or https link.",
    });
  }

  if (isDatabaseReady()) {
    let settings = await InstituteSettings.findOne();

    if (!settings) {
      settings = await InstituteSettings.create({
        ...runtimeInstituteSettings,
        ...nextSettings,
        logoUrl: logoUpload ? buildFileUrl(req, logoUpload) : nextSettings.logoUrl,
        websiteBannerUrl: bannerUpload ? buildFileUrl(req, bannerUpload) : nextSettings.websiteBannerUrl,
      });
    } else {
      settings.instituteName = nextSettings.instituteName;
      settings.instituteSubtitle = nextSettings.instituteSubtitle;
      settings.affiliation = nextSettings.affiliation;
      settings.logoUrl = logoUpload ? buildFileUrl(req, logoUpload) : nextSettings.logoUrl || settings.logoUrl;
      settings.websiteBannerUrl = bannerUpload
        ? buildFileUrl(req, bannerUpload)
        : nextSettings.websiteBannerUrl || settings.websiteBannerUrl;
      settings.contactEmail = nextSettings.contactEmail;
      settings.contactPhone = nextSettings.contactPhone;
      settings.address = nextSettings.address;
      settings.mapEmbedUrl = nextSettings.mapEmbedUrl;
      await settings.save();
    }

    return res.json({
      success: true,
      settings: buildPublicSettings(settings.toObject()),
    });
  }

  runtimeInstituteSettings.instituteName = nextSettings.instituteName;
  runtimeInstituteSettings.instituteSubtitle = nextSettings.instituteSubtitle;
  runtimeInstituteSettings.affiliation = nextSettings.affiliation;
  runtimeInstituteSettings.logoUrl = logoUpload ? buildFileUrl(req, logoUpload) : nextSettings.logoUrl;
  runtimeInstituteSettings.websiteBannerUrl = bannerUpload ? buildFileUrl(req, bannerUpload) : nextSettings.websiteBannerUrl;
  runtimeInstituteSettings.contactEmail = nextSettings.contactEmail;
  runtimeInstituteSettings.contactPhone = nextSettings.contactPhone;
  runtimeInstituteSettings.address = nextSettings.address;
  runtimeInstituteSettings.mapEmbedUrl = nextSettings.mapEmbedUrl;

  return res.json({
    success: true,
    settings: buildPublicSettings(runtimeInstituteSettings),
  });
};
