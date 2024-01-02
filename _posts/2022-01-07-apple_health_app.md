---
layout: post
title: How far did I walk with my iPhone?
date: 2022-01-07 12:00:00-0000
description: Analysis of Apple Health app data
tags: Health-data, Python, Pandas, Apple
categories: data-stories
#toc: true
giscus_comments: false
related_posts: false
---

## Introduction
One day, I was looking at the settings of the Health app on my iPhone and I found out the possibility of exporting all health data recorded over time.


<img src="/assets/img/apple_health_app/guide_to_export.png" width="100%" class="img-fluid rounded z-depth-1"/>


Immediately, some questions came to my mind: 
- *How far did I walk since I have this app?*
- *Can I study my habits by analysing such data?*
- *What kind of data does the app record?*

I tried to answer to such questions with **Python**.  

## Data description
Health data are provided in a `.xml` file. This file contains a list of *records* with the following structure:

<!-- <div style="height: 300px;overflow: scroll;"> -->

{% highlight xml linenos %}
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 15:25:45 +0100" startDate="2018-08-23 14:27:55 +0100" endDate="2018-08-23 14:34:13 +0100" value="17"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 15:25:45 +0100" startDate="2018-08-23 14:41:17 +0100" endDate="2018-08-23 14:47:37 +0100" value="13"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 15:25:45 +0100" startDate="2018-08-23 14:47:37 +0100" endDate="2018-08-23 14:53:08 +0100" value="27"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 15:25:45 +0100" startDate="2018-08-23 14:57:37 +0100" endDate="2018-08-23 15:03:45 +0100" value="10"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 15:25:45 +0100" startDate="2018-08-23 15:12:11 +0100" endDate="2018-08-23 15:22:10 +0100" value="80"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 15:22:10 +0100" endDate="2018-08-23 15:29:54 +0100" value="387"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 15:36:52 +0100" endDate="2018-08-23 15:42:57 +0100" value="10"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 15:46:17 +0100" endDate="2018-08-23 15:55:12 +0100" value="148"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 15:59:13 +0100" endDate="2018-08-23 16:07:33 +0100" value="94"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 16:07:33 +0100" endDate="2018-08-23 16:14:43 +0100" value="380"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 16:14:43 +0100" endDate="2018-08-23 16:23:30 +0100" value="337"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 16:23:30 +0100" endDate="2018-08-23 16:33:28 +0100" value="728"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 16:33:28 +0100" endDate="2018-08-23 16:43:22 +0100" value="137"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 16:43:22 +0100" endDate="2018-08-23 16:52:16 +0100" value="599"/>
 <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion="11.4.1" device="&lt;&lt;HKDevice: 0x282374b90&gt;, name:iPhone, manufacturer:Apple, model:iPhone, hardware:iPhone8,1, software:11.4.1&gt;" unit="count" creationDate="2018-08-23 17:34:46 +0100" startDate="2018-08-23 16:52:16 +0100" endDate="2018-08-23 17:00:58 +0100" value="189"/>
{% endhighlight %}

Each record represents a measurement and each measurement is characterised by the following main features:
- `type`: the quantity being measured. Possible values are:
  - `HKQuantityTypeIdentifierStepCount`: a quantity sample type that measures the number of steps the user has taken.
  - `HKQuantityTypeIdentifierDistanceWalkingRunning`: a quantity sample type that measures the distance the user has moved by walking or running.
  - `HKQuantityTypeIdentifierFlightsClimbed`: a quantity sample type that measures the number flights of stairs that the user has climbed. A flight of stairs is considered to be 3 meters high.
  - other values: for details read [Apple's Documentation](https://developer.apple.com/documentation/healthkit/data_types)
- `value`: the result of the measurement.
- `startDate`: the time at which the device started to measure.
- `endDate`: the time at which the device ended to measure.
- If you look carefully at the data, you may note an other feature: `CreationDate`. I wasn't able to find it into the documentation, so I don't know exactly what it stands for.

## Data preparation
By using the pandas method [`pandas.read_xml()`](https://pandas.pydata.org/docs/reference/api/pandas.read_xml.html), it is possible to read the file as pandas dataframe.

The data are not perfect, hence I have performed some data cleaning. 

Data before October 2019 are noisy, in the sense that there are days in which no activity was recorded by my phone and days in which there are only aggregated measures. This is probably due to missing authorizations I should have given to the app to record my activity. For this reason, in what follows, we will use only data from October 2019 on.

Moreover, since I wanted to associate to each sample a specific point in time instead of a time interval (`endDate`-`startDate`), I have computed a new feature called `middleDate` as below and I set it as index of the dataframe:

$$middleDate = startDate + \frac{(endDate-startDate)}{2}$$

I obtained a dataframe like this:

<style>
    table { border-collapse: collapse; border: 3px solid #eee; }
    table tr th:first-child { background-color: #eeeeee; color: #333; font-weight: bold }
    table thead th { background-color: #eee; color: #000; }
    tr, th, td { border: 1px solid #ccc; border-width: 0.5px 0 0 0.5px; border-collapse: collapse;
    padding: 5px; font-family: monospace; font-size: 10px }</style>

<div style="overflow: scroll;">
    <table border="0" class="dataframe">
    <thead>
        <tr class="header" style="text-align: left;">
        <th>middleDate</th>
        <th>type</th>
        <th>sourceName</th>
        <th>sourceVersion</th>
        <th>unit</th>
        <th>creationDate</th>
        <th>startDate</th>
        <th>endDate</th>
        <th>value</th>
        <th>device</th>
        </tr>
    </thead>
    <tbody>
        <tr>
        <td>2019-10-14 11:13:43+01:00</td>
        <td>HKQuantityTypeIdentifierStepCount</td>
        <td>iPhone</td>
        <td>13.1.2</td>
        <td>count</td>
        <td>2019-10-14 11:21:01+01:00</td>
        <td>2019-10-14 11:08:43+01:00</td>
        <td>2019-10-14 11:18:43+01:00</td>
        <td>705.00000</td>
        <td>&lt;&lt;HKDevice: 0x28239e3a0&gt;, name:...&gt;</td>
        </tr>
        <tr>
        <td>2020-07-12 11:24:24.500000+01:00</td>
        <td>HKQuantityTypeIdentifierDistanceWalkingRunning</td>
        <td>iPhone</td>
        <td>13.4.1</td>
        <td>km</td>
        <td>2020-07-12 11:32:40+01:00</td>
        <td>2020-07-12 11:24:22+01:00</td>
        <td>2020-07-12 11:24:27+01:00</td>
        <td>0.00556</td>
        <td>&lt;&lt;HKDevice: 0x28239eb20&gt;, name:...&gt;</td>
        </tr>
        <tr>
        <td>2021-10-04 09:46:40+01:00</td>
        <td>HKQuantityTypeIdentifierWalkingDoubleSupportPercentage</td>
        <td>iPhone</td>
        <td>14.5.1</td>
        <td>%</td>
        <td>2021-10-04 09:50:59+01:00</td>
        <td>2021-10-04 09:46:24+01:00</td>
        <td>2021-10-04 09:46:56+01:00</td>
        <td>0.30000</td>
        <td>&lt;&lt;HKDevice: 0x2823680a0&gt;, name:...&gt;</td>
        </tr>
    </tbody>
    </table>

</div>
<br>

## Exploratory Analysis
Let's start by looking at a global plot of the 3 main quantities my iPhone has recorded: **number of steps walked**, **number of kilometres walked** and **number of flights of stairs climbed** (remember: 1 flight of stairs $$\simeq$$ 3 meters).


<img src="/assets/img/apple_health_app/output/daily_info.png" width="100%" class="img-fluid rounded z-depth-1" />

From the graphs, without any statistical tool, just by visual inspection, we can observe several things:
1. There are many peaks, mainly concentrated in the summertime.
2. Some of those peaks seem to be anomalous.
3. There is a change in life style around March 2020.

### 1. Peaks
The concentration of peaks in the summertime is easily explainable: usually, in summer, people decide to hike in the mountains, depart for a trip and so on, and this usually translates into intense days from the physical activity perspective.

I belong to that category of people and, in fact, all those "summer peaks" correspond to trips, hikes et similia.

### 2. Anomalous peaks
If you look carefully, in June 2021, something weired is happening. 


<img src="/assets/img/apple_health_app/output/june2021_info.png" width="100%" class="img-fluid rounded z-depth-1" />

There are sharp peaks in the number of flights of stairs climbed that do not correspond to peaks in steps/distance walked. *Did I play with elevators all day long?*

The answer is: no, I didn't.

What is going on here is that I went cycling in the mountains. **While you ride on the bike, the Health app doesn't measure any step walked but it keeps track of the changes in altitude**. This explains why steps/distance walked do not present any peak while the floor count does. 

### 3. Change in life style
Around March 2020, a change in life style is observable:

<img src="/assets/img/apple_health_app/output/march2020_info.png" width="100%" class="img-fluid rounded z-depth-1" />


This change is not evident by looking only at the distance or steps walked but, once again, it is the number of flights of stairs climbed that brings the information. 

In 2020, the covid pandemic spread all over the world. In March, European countries started to proclaim national lockdowns and a lot of people were forced to stay at home. In that period, I was living in France for studying but on March 15th I decided to move back to Italy and stay with my family during the lockdown.

This is of course the reason behind the change in my physical activity habits. Indeed, In France my house was on top of a small hill and every day I had to walk up and down to go to the university and attend lectures.

**That's why, in the plot at the bottom of the previous figure, we can observe higher values before half of March and then they suddenly drop down.**

There is more. By looking closer at the data it is also possible to observe a curious trend. In the range of time from October 2019 to March 2020, i.e. the semester I have spent in France, if we look at the hourly evolution of the average number of floor climbed every day, we obtain the following:

<img src="/assets/img/apple_health_app/output/hourly_floors_climbed.png" width="100%" class="img-fluid rounded z-depth-1" />


Monday, Thursday and Friday show a different pattern and it is because... *on those days I had lectures at university and I went up and down the hill several times per day!*


<img src="/assets/img/apple_health_app/timetable.png" width="100%" class="img-fluid rounded z-depth-1" />
<div class="caption">
    Timetable of my courses at Université Côte D'Azur
</div>

Hence, only one question remains open: *why is the change in habits not showing up in the other meausures as well?* Because my house in Italy is located outside the city and I have a lot of space to workout, walk and so on. This allowed me to keep more or less the same physical activity habits, even though I was stuck at home.

## Conclusion
Data tell stories and this post is it proof. Looking at the data from the right perspective helps you understand the story they tell. This whole post originated from a single chart and a visual inspection. This is an other proof of how rich a dataset can be. Being a data scientist means to be able to discover and exploit such value.

## Notes
If you are interested in the code I have written for the analysis, by clicking on the button below you can download the html copy of my Jupyter Notebook.

[HTML](/assets/html/apple_health_app/apple_health_app_notebook.html){: .btn}