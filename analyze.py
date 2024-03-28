import pandas as pd

set1 = pd.read_csv('pull_data.csv')
set2 = pd.read_csv('technicalAssessment-GoogleReviews.csv')

set2_cleaned = set2.drop_duplicates(subset='website', keep='first')
set1['storeID'] = 'no match'

for index, row in set2_cleaned.iterrows():
    url = row['website']
    matching_row = set1[set1['url'] == url]
    if not matching_row.empty:
        if isinstance(row['storeID'], int):
            set1.loc[set1['url'] == url, 'storeID'] = row['storeID']
        

grouped_data = set2.groupby('storeID')['overallRating'].agg(['mean', 'count']).reset_index()
grouped_data.columns = ['storeID', 'averageRating', 'reviewCount']



set1 = pd.merge(set1, grouped_data, on='storeID', how='left')
set1.to_csv('updated_pull_data.csv', index=False)

grouped_data1 = set1.groupby('state')['averageRating'].agg(['mean', 'count']).reset_index()
grouped_data1.columns = ['state', 'averageRating', 'reviewCount']
print(grouped_data1)
print(set1.loc[set1['averageRating'].idxmax()])
print(set1.loc[set1['reviewCount'].idxmax()])

grouped_data1.to_csv('updated_pull_data1.csv', index=False)