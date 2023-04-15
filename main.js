const axios = require('axios');
const CSVManager = require('./csv-manager.js');
const prompt = require('prompt-sync')({sigint: true});

// 4260 is the code for Summer Quarter 2021.
// 4300 is the code for Fall Quarter 2021.
// 4320 is the code for Winter Quarter 2022
// 4340 is the code for Spring Quarter 2022.
// 4360 is the code for Summer Quarter 2022.
// 4400 is the code for Fall Quarter 2022.
// 4420 is the code for Winter Quarter 2023.
// 4440 is the code for Spring Quarter 2023.

/*

1. We first define an object called quarterMap which maps the academic quarter to the quarter code.
2. We then define a function called get_courses which takes in the core code and the quarter code.
3. We then use the requests library to make a POST request to the SCU CourseAvail website.
4. We then use the json library to parse the response.
5. We then return the data from the response.

*/

const quarterMap = {
    "Spring 2023": "4440",
    "Winter 2023": "4420",
    "Fall 2022": "4400",
    "Summer 2022": "4360",
    "Spring 2022": "4340",
    "Winter 2022": "4320",
    "Fall 2021": "4300",
    "Summer 2021": "4260" 
}

const quarterNameMap = {
    "Spring 2023": "spring2023",
    "Winter 2023": "winter2023",
    "Fall 2022": "fall2022",
    "Summer 2022": "summer2022",
    "Spring 2022": "spring2022",
    "Winter 2022": "winter2022",
    "Fall 2021": "fall2021",
    "Summer 2021": "summer2021"
}

const get_cores = async (quarterCode) => {
    const headers = {
        "authority": "www.scu.edu",
        "accept": "*/*",
        "x-requested-with": "XMLHttpRequest",
        "user-agent": process.env.USER_AGENT,
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-gpc": "1",
        "origin": "https://www.scu.edu",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "accept-language": "en-US,en;q=0.9",
    };
    
    const response = await axios.get(`https://www.scu.edu/apps/ws/courseavail/autocomplete/${quarterCode}/pathways`, {headers});
    const data = response.data;
    return data;
}

const get_courses = async (core, quarterCode) => {
    const payload = `newcore=${core}&maxRes=10000`;
    const headers = {
        "authority": "www.scu.edu",
        "accept": "*/*",
        "x-requested-with": "XMLHttpRequest",
        "user-agent": process.env.USER_AGENT,
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-gpc": "1",
        "origin": "https://www.scu.edu",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "accept-language": "en-US,en;q=0.9",
    };

    const response = await axios.post(`https://www.scu.edu/apps/ws/courseavail/search/${quarterCode}/ugrad`, payload, {headers});
    const data = response.data;
    return data;
}

const validateInput = async () => {   
    let quarter;

    let command = parseInt(prompt('Select academic quarter: '));

    switch (command) {
        case 1:
            quarter = 'Spring 2023'; 
            break;
        case 2:
            quarter = 'Winter 2023'; 
            break;
        case 3:
            quarter = 'Fall 2022'; 
            break;
        case 4:
            quarter = 'Summer 2022'; 
            break;
        case 5:
            quarter = 'Spring 2022'; 
            break;
        case 6:
            quarter = 'Winter 2022'; 
            break;
        case 7:
            quarter = 'Fall 2021'; 
            break;
        case 8:
            quarter = 'Summer 2021'; 
            break;
        default:
            quarter = 'Spring 2023';
            break;
    } 
    
    const courses = {};
    const coreDict = {};

    // Fetch core requirements/pathways and add it to object
    const data = await get_cores(quarterMap[quarter]);

    for (const info of data.results) {
        coreDict[info['value']] = info['label'];
    }

    for (const core in coreDict) {
        console.log(`Fetching ${coreDict[core]} . . .`)

        // Fetch course data and add it to object
        const data = await get_courses(core, quarterMap[quarter]);

        for (const info of data.results) {
            if (info['class_nbr'] in courses) {
                const newCore = `${courses[info['class_nbr']]['core']}, ${coreDict[core]}`
                courses[info['class_nbr']]['core'] = newCore;
            } else {
                const newCourse = {
                    "class": `${info['subject']} ${info['catalog_nbr']} (${info['class_nbr']})`,
                    "description": info["class_descr"],
                    "core": `${coreDict[core]}`,
                    "days-times": `${info['mtg_days_1']} ${info['mtg_time_beg_1']} - ${info['mtg_time_end_1']}` 
                      || "TBA",
                    "room": `${info['mtg_facility_1'] || 'TBA' }`,
                    "instructor": `${info['instr_1'] || 'TBA' }`,
                    "units": info["units_minimum"],
                    "seats": info["seats_remaining"] > 0 ? info["seats_remaining"] : "None",
                  };                  

                courses[info['class_nbr']] = newCourse;
            }
        }
    }

    const rows = ["CLASS", "DESCRIPTION", "CORES SATISFIED", "DAYS/TIMES", "ROOM", "INSTRUCTOR", "UNITS", "SEATS REMAINING"];

    const fileName = `scu_double_dips-${quarterNameMap[quarter]}`;
    const fp = new CSVManager(fileName);
    fp.writeRow(rows); // write header

    const coursesArr = Object.values(courses);

    coursesArr.forEach((course) => {
        if (course['core'].includes(',')) {
            const keys = Object.keys(course);
            let course_data = [];
            keys.forEach((key) => {
                course_data.push(course[key]);
            });

            fp.writeRow(course_data);
        }
    });

    console.log(`=== Finished fetching core requirements for ${quarter}! ===\n\n`)
}

validateInput();