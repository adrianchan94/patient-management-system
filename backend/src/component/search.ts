import { Request } from 'express';
import { EntityManager } from 'typeorm';
import { Organisation } from '../entity/organisation';
import { Result } from '../entity/result';
import { logger } from './logger';

export async function search(
    manager: EntityManager,
    organisation: Organisation,
    params: Request['params'],
    query: Request['query'] = {},
) {
    console.log('==== SEARCH FUNCTION DEBUG ====');
    console.log('Search function called with query:', JSON.stringify(query));
    console.log('Raw query object keys:', Object.keys(query));
    console.log('Raw query object values:', Object.values(query));
    
    try {
        // Extract search parameters from query
        const patientName = query['patientName'] || query['filter[patientName]'] || (query.filter && query.filter.patientName);
        const sampleId = query['sampleId'] || query['filter[sampleId]'] || (query.filter && query.filter.sampleId);
        const profileId = query['profileId'] || query['patientId'] || query['filter[profileId]'] || (query.filter && query.filter.profileId);
        const activationDate = query['activationDate'] || query['activateTime'] || query['filter[activationDate]'] || (query.filter && query.filter.activationDate);
        const resultDate = query['resultDate'] || query['resultTime'] || query['filter[resultDate]'] || (query.filter && query.filter.resultDate);
        
        console.log('Search parameters:', { patientName, sampleId, profileId, activationDate, resultDate });
        console.log('Raw filter[profileId]:', query['filter[profileId]']);
        console.log('Raw profileId:', query['profileId']);
        console.log('Raw patientId:', query['patientId']);
        console.log('Raw filter object:', query.filter);
        
        // Handle pagination
        let offset = 0;
        let limit = 15;
        
        // Check for page[offset] and page[limit] format (used by frontend)
        console.log('==== PAGINATION DEBUG ====');
        console.log('Raw query object:', JSON.stringify(query));
        console.log('Raw page[offset]:', query['page[offset]']);
        console.log('Raw page[limit]:', query['page[limit]']);
        
        // Handle different formats of pagination parameters
        if (query['page[offset]'] !== undefined) {
            // Try to parse as number directly
            const offsetStr = query['page[offset]'].toString();
            offset = parseInt(offsetStr, 10);
            console.log(`Using offset pagination with offset string: "${offsetStr}", parsed as: ${offset}`);
        }
        
        if (query['page[limit]'] !== undefined) {
            // Try to parse as number directly
            const limitStr = query['page[limit]'].toString();
            limit = parseInt(limitStr, 10);
            console.log(`Using limit pagination with limit string: "${limitStr}", parsed as: ${limit}`);
        }
        
        // Build base query
        const resultsQuery = manager
            .createQueryBuilder(Result, 'result')
            .innerJoinAndSelect('result.profile', 'profile')
            .innerJoin('profile.organisation', 'organisation', 'organisation.organisationId = :organisationId', {
                organisationId: organisation.organisationId,
            })
            .orderBy('result.activateTime', 'DESC');
        
        // Apply filters
        if (sampleId) {
            resultsQuery.andWhere('result.sampleId LIKE :sampleId', { sampleId: `%${sampleId}%` });
            console.log('Added sampleId filter:', sampleId);
        }

        // Add profile ID filter
        if (profileId) {
            console.log('Adding profileId filter:', profileId);
            
            // Check if this is a complete UUID (36 characters with hyphens) or a partial one
            const isCompleteUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
            
            if (isCompleteUuid) {
                // For complete UUIDs, use exact matching for better performance
                console.log('Using exact UUID matching');
                resultsQuery.andWhere('profile.profileId = :profileId', { 
                    profileId: profileId 
                });
            } else {
                // For partial UUIDs, use LIKE with CAST to text
                console.log('Using partial UUID matching with LIKE');
                resultsQuery.andWhere('CAST(profile.profileId AS TEXT) LIKE :profileId', { 
                    profileId: `%${profileId}%` 
                });
            }
            
            console.log('SQL query with profileId filter:', resultsQuery.getSql());
            console.log('SQL parameters:', resultsQuery.getParameters());
            
            // Run a direct test query to verify our filter works
            console.log('Running test query to verify profile ID filter...');
            manager.query(`
                SELECT p.profileid, p.name
                FROM test.profile p
                WHERE ${isCompleteUuid 
                    ? `p.profileid = '${profileId}'` 
                    : `CAST(p.profileid AS TEXT) LIKE '%${profileId}%'`}
                AND p."organisationOrganisationId" = '${organisation.organisationId}'
                LIMIT 5
            `).then(results => {
                console.log('Test query results:', results);
                if (results.length === 0) {
                    console.warn('WARNING: Test query returned no results!');
                }
            }).catch(error => {
                console.error('Test query error:', error);
            });
        }
        
        if (activationDate) {
            // Convert the date string to a Date object and format it
            try {
                const date = new Date(activationDate);
                if (!isNaN(date.getTime())) {
                    const formattedDate = date.toISOString().split('T')[0];
                    resultsQuery.andWhere('DATE(result.activateTime) = :activationDate::date', { activationDate: formattedDate });
                    console.log('Applying activation date filter:', formattedDate);
                }
            } catch (error) {
                console.error('Invalid activation date format:', activationDate);
            }
        }
        
        if (resultDate) {
            // Convert the date string to a Date object and format it
            try {
                const date = new Date(resultDate);
                if (!isNaN(date.getTime())) {
                    const formattedDate = date.toISOString().split('T')[0];
                    resultsQuery.andWhere('DATE(result.resultTime) = :resultDate::date', { resultDate: formattedDate });
                    console.log('Applying result date filter:', formattedDate);
                }
            } catch (error) {
                console.error('Invalid result date format:', resultDate);
            }
        }
        
        // Get total count for pagination
        const totalCount = await resultsQuery.getCount();
        console.log(`Total count before pagination: ${totalCount}`);
        
        // Log the SQL query being executed
        console.log('SQL Query:', resultsQuery.getSql());
        console.log('SQL Parameters:', resultsQuery.getParameters());
        
        // Apply pagination to the query
        resultsQuery.skip(offset).take(limit);
        
        // Execute query with pagination
        let results = await resultsQuery.getMany();
        console.log(`Query returned ${results.length} results after database pagination`);
        
        // If we're filtering by profileId, log the profile IDs of the results
        if (profileId) {
            console.log('Profile IDs in results:');
            results.forEach(result => {
                console.log(`- ${result.profile.profileId} (${result.profile.profileId.includes(profileId) ? 'MATCH' : 'NO MATCH'})`);
            });
            
            // Check if we have the expected results
            const matchingProfiles = results.filter(result => 
                result.profile.profileId.toLowerCase().includes(profileId.toLowerCase())
            );
            console.log(`Found ${matchingProfiles.length} results with profileId containing '${profileId}'`);
            
            if (matchingProfiles.length === 0 && results.length > 0) {
                console.warn('WARNING: No matching profiles found despite having results!');
            }
        }
        
        // Apply post-processing filters
        let filteredResults = results;
        let totalFilteredCount = totalCount;
        
        // Filter by profile ID in memory if needed
        if (profileId) {
            console.log('Applying profile ID filter in memory as a fallback...');
            const profileIdLower = profileId.toLowerCase();
            
            // Check if this is a complete UUID (36 characters with hyphens) or a partial one
            const isCompleteUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
            
            // Filter results by profile ID
            const profileIdFilteredResults = results.filter(result => {
                const resultProfileId = result.profile.profileId;
                
                if (isCompleteUuid) {
                    // For complete UUIDs, use exact matching
                    return resultProfileId.toLowerCase() === profileIdLower;
                } else {
                    // For partial UUIDs, use includes
                    return resultProfileId.toLowerCase().includes(profileIdLower);
                }
            });
            
            console.log(`After filtering by profile ID in memory: ${profileIdFilteredResults.length} results out of ${results.length}`);
            
            // Only use the memory-filtered results if they're different from the original results
            // and there's at least one match
            if (profileIdFilteredResults.length > 0 && profileIdFilteredResults.length < results.length) {
                console.log('Using memory-filtered results for profile ID');
                filteredResults = profileIdFilteredResults;
                totalFilteredCount = profileIdFilteredResults.length;
            } else if (profileIdFilteredResults.length === 0 && results.length > 0) {
                console.warn('WARNING: No matching profiles found in memory filtering!');
            }
        }
        
        // Filter by patient name in memory if needed
        if (patientName) {
            console.log('Applying patient name filter in memory:', patientName);
            const patientNameLower = patientName.toLowerCase();
            
            // We need to get all results to filter by patient name
            const allResults = await manager
                .createQueryBuilder(Result, 'result')
                .innerJoinAndSelect('result.profile', 'profile')
                .innerJoin('profile.organisation', 'organisation', 'organisation.organisationId = :organisationId', {
                    organisationId: organisation.organisationId,
                })
                .orderBy('result.activateTime', 'DESC')
                .getMany();
            
            // Filter all results by patient name
            const allFilteredResults = allResults.filter(result => {
                const profileName = result.profile.name;
                return profileName && profileName.toLowerCase().includes(patientNameLower);
            });
            
            console.log(`After filtering by name: ${allFilteredResults.length} results out of ${allResults.length}`);
            
            // Update total count for pagination
            totalFilteredCount = allFilteredResults.length;
            
            // Apply pagination to the filtered results
            filteredResults = allFilteredResults.slice(offset, offset + limit);
            console.log(`After pagination: ${filteredResults.length} results`);
        }
        
        // Format response according to JSON:API specification
        const response = {
            data: filteredResults.map(result => ({
                type: 'result',
                id: result.resultId,
                attributes: {
                    sampleId: result.sampleId,
                    resultType: result.type,
                    result: result.result,
                    activateTime: result.activateTime,
                    resultTime: result.resultTime,
                },
                relationships: {
                    profile: {
                        data: {
                            type: 'profile',
                            id: result.profile.profileId,
                        },
                    },
                },
            })),
            included: [
                ...filteredResults.map(result => ({
                    type: 'profile',
                    id: result.profile.profileId,
                    attributes: {
                        name: result.profile.name,
                    },
                    relationships: {
                        organisation: {
                            data: {
                                type: 'organisation',
                                id: organisation.organisationId,
                            },
                        },
                    },
                })),
                {
                    type: 'organisation',
                    id: organisation.organisationId,
                    attributes: {
                        name: organisation.name,
                    },
                },
            ],
            meta: {
                total: totalFilteredCount,
                offset: offset,
                limit: limit,
            },
        };
        
        return response;
    } catch (error) {
        console.error('Error in search function:', error);
        logger.error('Error in search function: ' + (error instanceof Error ? error.message : String(error)));
        throw error;
    }
}
