import {
  getActiveCitiesByState,
  getActiveCountries,
  getActiveStatesByCountry
} from "../models/locationModel.js";

export async function listCountries(_req, res, next) {
  try {
    const data = await getActiveCountries();
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listStates(req, res, next) {
  try {
    const countryId = Number(req.query.country_id);
    const data = await getActiveStatesByCountry(countryId);
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listCities(req, res, next) {
  try {
    const stateId = Number(req.query.state_id);
    const data = await getActiveCitiesByState(stateId);
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}
