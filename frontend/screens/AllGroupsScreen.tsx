import * as React from 'react';
import { Text, View, Image, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { NavigationContainer, TabRouter, useIsFocused } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { getGroupData, GroupData } from '../services/GroupServices';
import GroupNameButton from '../components/GroupNameButton';
import route from "../navigation";
import { TabView } from '@rneui/base';
import InfoBox from '../components/InfoBox';
import TextHeader from '../components/TextHeader';
import ScreenHeaderText from '../components/ScreenHeaderText';
import BackArrow from '../components/BackArrow';
import BigPlus from '../components/BigPlus';
import BurgerIcon from '../components/BurgerIcon';
import { DatePollData, getDatePollDataByGroupId } from '../services/DatePollServices';
import { getLocationPollDataByGroupId, LocationPollData } from '../services/LocationPollServices';
import { ActivityPollData, getActivityPollDataByGroupId } from '../services/ActivityPollServices';
import DatePollButton from '../components/DatePollButton';
import NewEvent from './NewEvent/NewEvent';
import { isSearchBarAvailableForCurrentPlatform } from 'react-native-screens';
import AddGroupScreen from './AddGroupScreen';
import SmallPlus from '../components/SmallPlus';

interface Props {
  user: number
}

export default function AllGroupsScreen(props: Props) {

    const { user } = props;

  const isFocused = useIsFocused()

  const initialState = {
    id: "",
    groupName: "",
    events: [
      {
      id:"",
      date:"",
      eventName:"",
      eventLocation:"", 
      activity:"", 
      activityPoll:"",
      locationPoll:"", 
      datePoll:""
      }
    ],
  }; 

  const [groups, setGroup] = useState<GroupData[]>();
    const [singleGroup, setSingleGroup] = useState(initialState);
    const [groupView, setGroupView] = useState("allgroups");
    const [groupPolls, setGroupPolls] = useState<(DatePollData | ActivityPollData | LocationPollData)[]>();
    const [activeGroupPoll, setActiveGroupPoll] = useState<(DatePollData | ActivityPollData | LocationPollData)>();

    useEffect(() => {
      if (isFocused){
        setSingleGroup(initialState)
        setGroupView("allgroups")
      }
      getGroupData()
      .then((userGroups) => {
        setGroup(userGroups);
      })
    }, [isFocused]);

    useEffect(()=>{
      const allGroupsPolls: Array<DatePollData | ActivityPollData | LocationPollData> = [];

    Promise.all([
        getDatePollDataByGroupId(singleGroup.id),
        getActivityPollDataByGroupId(singleGroup.id),
        getLocationPollDataByGroupId(singleGroup.id)
    ]).then((polls) => {
        polls.flat().forEach((poll) => {
            if (Date.parse(poll.timeout) > Date.now()) {
              allGroupsPolls.push(poll);
                    }                        
                })
            })
            .then(()=>{
              findActivePoll(allGroupsPolls)
            })
            , [];
          }, [singleGroup]);
    
    var allUsersGroupsByName = groups?.flatMap(function(val, index){
      return <GroupNameButton key={index} title={val.groupName} status={false} onPress={()=>captureChosenGroup(val)}/>
     })

     function captureChosenGroup(group:GroupData){
      setSingleGroup(group)
      setGroupView("singlegroup")
     }

     function addNewEvent(){
      setGroupView("newEvent")


     }

     function findActivePoll(allGroupPolls){
      const upcomingPoll: DatePollData | ActivityPollData | LocationPollData = allGroupPolls.find(poll => (Date.parse(poll.timeout) - Date.now()>0))
      setActiveGroupPoll(upcomingPoll)
     }


     function SingleGroupDetails(){
        if (Date.parse(singleGroup.events[0].date) > Date.now()) {

          const eventDate = new Date(singleGroup.events[0].date).toLocaleString('en-GB', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
          return (
            <>
            <TextHeader>{singleGroup.events[0].eventName}</TextHeader>
            <>
            <Text>Date:         {eventDate}</Text>
            <Text>Time:         TBC</Text>
            <Text>Location:   {singleGroup.events[0].eventLocation}</Text>
            </>
            </>
            )
                } else
                {
                  return (
                    <>
                    <TextHeader> No upcoming event </TextHeader>
                    <Text>Date:        </Text>
                    <Text>Time:        </Text>
                    <Text>Location:   </Text>
                    </>
                    )
                } 
              }   
     

     function SingleGroupPollDetails(){
      let availableOptions = []
      let voteCount = new Map()
      for (const [option, user_ids] of Object.entries(activeGroupPoll?.options)) {
          availableOptions.push(option)
          voteCount.set(option, user_ids)
        }
          var getOptions = availableOptions.map(function(val, index){
          return <><DatePollButton key={index} dateOption={val} onPress={()=>captureChosenVote(val)}></DatePollButton><Text style={styles.voteCounter}>2</Text></>
        })

        function captureChosenVote(val: string){
          for (const [option, user_ids] of Object.entries(activeGroupPoll.options)){
            if (val == option){
              console.log(user_ids.length)
            }
          }
            }
        return getOptions
        }
     

     function AllGroupView(){
      return(
      <>
      <Image source={require('../assets/GroupLogo1.png')}/>
      <ScrollView style={styles.scroll}>{allUsersGroupsByName}</ScrollView> 
      <BigPlus onPress={() => (setGroupView('addgroupview'))}/>
      </>
      ) 
    }


    function AddEventView(){

      return (
        <>
          <NewEvent singleGroupName={singleGroup.groupName} singleGroupId={singleGroup.id} setState={setGroupView}></NewEvent>
        </>
      )

    }
     
     function SingleGroupView(){
      return(
      <>
      <View style={styles.header}>
          <BackArrow onPress={() => setGroupView("allgroups")}></BackArrow>
          <ScreenHeaderText>{singleGroup.groupName}</ScreenHeaderText>
          <BurgerIcon></BurgerIcon>
        </View>
            <InfoBox header='Next Event' smallPlus={<SmallPlus onPress={()=>addNewEvent()} />} ><SingleGroupDetails/></InfoBox>
            <InfoBox header={activeGroupPoll.event.eventName}><View><SingleGroupPollDetails/></View></InfoBox>
          </>
        )
     }

     function AddGroupView(){
      return(
        <AddGroupScreen user={user}/>
      )
      }


    
    return (
        <SafeAreaView style={styles.container}>
          {groupView === "allgroups" ? <AllGroupView/> : ""}
          {groupView==="singlegroup"? <SingleGroupView/>: ""}
          {groupView === "addgroupview" ? <AddGroupView/>: ""}
          {groupView === "newEvent" ? <AddEventView/>: ""}
          
        </SafeAreaView>
    )
    }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25242B',

      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
      },
      scroll: {
        flex: 1,
        width:'90%',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent:'space-between',
        width:"100%",
      justifyContent: 'space-around',

      },
      voteCounter: {
        color: "#FF914D",
        fontSize: 36,
        alignItems:'center'
    }
  });
