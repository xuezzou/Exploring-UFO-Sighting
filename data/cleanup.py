import csv
with open("scrubbed.csv") as infile, open ("ufo_data_cleaned.csv", "w") as outfile:
	reader = csv.reader(infile, delimiter=",")
	next(reader,None)	
	writer = csv.writer(outfile, delimiter=',')#, quotechar="", quoting=csv.QUOTE_ALL)
	
	writer.writerow(["year", "state", "country", "shape", "duration", "latitude", "longtitude"])

	for line in reader:

		record_it = True
		
		for i in range(0, len(line)):
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
		if country!='us':
			record_it = False

		if shape == '':
			shape = 'other'

#write out to file
		if record_it == True:
			print year, state, country, shape		
			writer.writerow([year, state, country, shape, duration, latitude, longtitude])

