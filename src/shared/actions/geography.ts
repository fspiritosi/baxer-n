'use server';

import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';

// ============================================
// COUNTRIES
// ============================================

/**
 * Obtener todos los países activos
 */
export async function getCountries() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return countries;
  } catch (error) {
    logger.error('Error al obtener países:', { data: { error } });
    throw new Error('No se pudieron obtener los países');
  }
}

/**
 * Obtener un país por ID
 */
export async function getCountryById(id: number) {
  try {
    const country = await prisma.country.findUnique({
      where: { id },
    });
    return country;
  } catch (error) {
    logger.error('Error al obtener país:', { data: { error, id } });
    throw new Error('No se pudo obtener el país');
  }
}

/**
 * Obtener países para select (solo id y nombre)
 */
export async function getCountriesForSelect() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });
    return countries;
  } catch (error) {
    logger.error('Error al obtener países para select:', { data: { error } });
    throw new Error('No se pudieron obtener los países');
  }
}

// ============================================
// PROVINCES
// ============================================

/**
 * Obtener todas las provincias activas
 */
export async function getProvinces() {
  try {
    const provinces = await prisma.province.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return provinces;
  } catch (error) {
    logger.error('Error al obtener provincias:', { data: { error } });
    throw new Error('No se pudieron obtener las provincias');
  }
}

/**
 * Obtener una provincia por ID
 */
export async function getProvinceById(id: number) {
  try {
    const province = await prisma.province.findUnique({
      where: { id },
      include: {
        cities: {
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    return province;
  } catch (error) {
    logger.error('Error al obtener provincia:', { data: { error, id } });
    throw new Error('No se pudo obtener la provincia');
  }
}

/**
 * Obtener provincias para select (solo id y nombre)
 */
export async function getProvincesForSelect() {
  try {
    const provinces = await prisma.province.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
    return provinces;
  } catch (error) {
    logger.error('Error al obtener provincias para select:', { data: { error } });
    throw new Error('No se pudieron obtener las provincias');
  }
}

// ============================================
// CITIES
// ============================================

/**
 * Obtener todas las ciudades activas
 */
export async function getCities() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      include: {
        province: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ province: { name: 'asc' } }, { name: 'asc' }],
    });
    return cities;
  } catch (error) {
    logger.error('Error al obtener ciudades:', { data: { error } });
    throw new Error('No se pudieron obtener las ciudades');
  }
}

/**
 * Obtener una ciudad por ID
 */
export async function getCityById(id: number) {
  try {
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        province: {
          select: { id: true, name: true },
        },
      },
    });
    return city;
  } catch (error) {
    logger.error('Error al obtener ciudad:', { data: { error, id } });
    throw new Error('No se pudo obtener la ciudad');
  }
}

/**
 * Obtener ciudades por provincia
 */
export async function getCitiesByProvince(provinceId: number) {
  try {
    const cities = await prisma.city.findMany({
      where: {
        provinceId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
    return cities;
  } catch (error) {
    logger.error('Error al obtener ciudades por provincia:', { data: { error, provinceId } });
    throw new Error('No se pudieron obtener las ciudades');
  }
}

/**
 * Obtener ciudades para select (solo id y nombre)
 */
export async function getCitiesForSelect() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        provinceId: true,
      },
      orderBy: { name: 'asc' },
    });
    return cities;
  } catch (error) {
    logger.error('Error al obtener ciudades para select:', { data: { error } });
    throw new Error('No se pudieron obtener las ciudades');
  }
}

// ============================================
// TIPOS INFERIDOS
// ============================================

export type Country = Awaited<ReturnType<typeof getCountryById>>;
export type CountryOption = Awaited<ReturnType<typeof getCountriesForSelect>>[number];
export type Province = Awaited<ReturnType<typeof getProvinceById>>;
export type ProvinceOption = Awaited<ReturnType<typeof getProvincesForSelect>>[number];
export type City = Awaited<ReturnType<typeof getCityById>>;
export type CityOption = Awaited<ReturnType<typeof getCitiesForSelect>>[number];
export type CityByProvince = Awaited<ReturnType<typeof getCitiesByProvince>>[number];
