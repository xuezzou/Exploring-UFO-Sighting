import csv


states = {
        'AK': 'Alaska',
        'AL': 'Alabama',
        'AR': 'Arkansas',
        'AS': 'American Samoa',
        'AZ': 'Arizona',
        'CA': 'California',
        'CO': 'Colorado',
        'CT': 'Connecticut',
        'DC': 'District of Columbia',
        'DE': 'Delaware',
        'FL': 'Florida',
        'GA': 'Georgia',
        'GU': 'Guam',
        'HI': 'Hawaii',
        'IA': 'Iowa',
        'ID': 'Idaho',
        'IL': 'Illinois',
        'IN': 'Indiana',
        'KS': 'Kansas',
        'KY': 'Kentucky',
        'LA': 'Louisiana',
        'MA': 'Massachusetts',
        'MD': 'Maryland',
        'ME': 'Maine',
        'MI': 'Michigan',
        'MN': 'Minnesota',
        'MO': 'Missouri',
        'MP': 'Northern Mariana Islands',
        'MS': 'Mississippi',
        'MT': 'Montana',
        'NA': 'National',
        'NC': 'North Carolina',
        'ND': 'North Dakota',
        'NE': 'Nebraska',
        'NH': 'New Hampshire',
        'NJ': 'New Jersey',
        'NM': 'New Mexico',
        'NV': 'Nevada',
        'NY': 'New York',
        'OH': 'Ohio',
        'OK': 'Oklahoma',
        'OR': 'Oregon',
        'PA': 'Pennsylvania',
        'PR': 'Puerto Rico',
        'RI': 'Rhode Island',
        'SC': 'South Carolina',
        'SD': 'South Dakota',
        'TN': 'Tennessee',
        'TX': 'Texas',
        'UT': 'Utah',
        'VA': 'Virginia',
        'VI': 'Virgin Islands',
        'VT': 'Vermont',
        'WA': 'Washington',
        'WI': 'Wisconsin',
        'WV': 'West Virginia',
        'WY': 'Wyoming'
}

with open("scrubbed.csv") as infile, open ("ufo_data_cleaned.csv", "w") as outfile:
	reader = csv.reader(infile, delimiter=",")
	next(reader,None)	
	writer = csv.writer(outfile, delimiter=',')#, quotechar="", quoting=csv.QUOTE_ALL)
	
	writer.writerow(["year", "state", "country", "shape", "duration", "latitude", "longtitude"])

	for line in reader:

		record_it = True
		
		#for i in range(0, len(line)):
		time = line[0]
		city = line[1]
		state = line[2]
		country = line[3]
		shape = line[4]
		duration = line[5]
		latitude = line[9]
		longtitude = line[10]
			#print latitude
#data processing
		date = time.split(" ")
		detailed_date = date[0].split("/")
		year=detailed_date[2]
		
		if state == 0:
			record_it = False
		else:
			#print state.upper()
			if state.upper() in states:
				a = states[state.upper()]
				state = a
			#print state
			#state = states[state.upper()]	
		if country!='us':
			record_it = False

		if shape == '':
			shape = 'other'


#write out to file
		if record_it == True:
			print year, state, country, shape		
			writer.writerow([year, state, country, shape, duration, latitude, longtitude])


