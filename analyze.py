import pandas as pd

set1 = pd.read_csv('initial_pulled_data.csv')
set2 = pd.read_csv('technicalAssessment-GoogleReviews.csv')

set2_cleaned = set2.drop_duplicates(subset='website', keep='first')
set1['storeID'] = 'no match'

for index, row in set2_cleaned.iterrows():
    url = row['website']
    matching_row = set1[set1['url'] == url]
    if not matching_row.empty:
        if isinstance(row['storeID'], int):
            set1.loc[set1['url'] == url, 'storeID'] = row['storeID']
        

grouped_data = set2.groupby('storeID')['reviewRating'].agg(['mean', 'count']).reset_index()

grouped_data.columns = ['storeID', 'averageRating', 'reviewCount']



set2['reviewRating'] = set2[set2['reviewRating'] < 2]['reviewRating']

setLow = set2.groupby('storeID')['reviewRating'].agg(['count']).reset_index()

setLow.columns = ['storeID', 'lowCount']

# Print the resulting DataFrame









# grouped_data_lowrating = filtered_set2.groupby('storeID').size().reset_index(name='lowRatings')


# print('min:/n' + str(grouped_data_lowrating.loc[grouped_data_lowrating['lowRatings'].idxmax()]))

set4 = set1

set4 = set4.drop(['url'], axis=1)
set4.to_csv('requested_data.csv', index=False)
set1 = pd.merge(set1, grouped_data, on='storeID', how='left')
set1 = pd.merge(set1, setLow, on='storeID', how='left')
set1.to_csv('reviewratings&count_data.csv', index=False)

grouped_data1 = set1.groupby('state')['averageRating'].agg(['mean', 'count']).reset_index()
grouped_data1.columns = ['state', 'averageRating', 'reviewCount']
# uncross to get the star reviews
# results_df = pd.DataFrame(columns=set1.columns)


# results_df = pd.concat([results_df, set1.loc[set1['averageRating'].idxmax()]], ignore_index=True)
# results_df = pd.concat([results_df, set1.loc[set1['reviewCount'].idxmax()]], ignore_index=True)
# results_df = pd.concat([results_df, set1.loc[set1['averageRating'].idxmin()]], ignore_index=True)
# results_df = pd.concat([results_df, set1.loc[set1['reviewCount'].idxmin()]], ignore_index=True)
# results_df = pd.concat([results_df, set1.loc[set1['lowCount'].idxmax()]], ignore_index=True)
# results_df = pd.concat([results_df, set1.loc[set1['lowCount'].idxmin()]], ignore_index=True)


# results_df.to_csv('data.csv', index = False)
# grouped_data1.to_csv('updated_pull_data1.csv', index=False)