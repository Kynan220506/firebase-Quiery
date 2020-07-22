import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import {Barcodescanner} from 'expo-barcode-scanner'
import * as firebase from 'firebase';
import db from '../config.js'

export default class TransactionScreen extends React.Component {
  constructor(){
    super();
    this.state={
      hasCameraPermissions:null,
      scanned:false,
      scannedData:'',
      buttonState:'normal',
      scannedBookId : '',
      scannedStudentId : '',
      buttonState : 'normal',
      transactionMessage : ''
    }
  }

  getCameraPermissions = async (id) =>{
    const {status}  = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
        status === "granted" is false when user has not granted the permission
      */
      hasCameraPermissions : status === "granted",
      buttonState : id,
      scanned : false
    })
  }

  handleBarCodeScanned  = async ({type, data})=>{
    const { buttonState} = this.state
  }

  getCameraPermissions = async () =>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    
    this.setState({
      /*status === "granted" is true when user has granted permission
        status === "granted" is false when user has not granted the permission
      */
      hasCameraPermissions: status === "granted",
      buttonState: 'clicked',
      scanned: false
    });
  }
  handleBarCodeScanned = async({type, data})=>{
    this.setState({
      scanned: true,
      scannedData: data,
      buttonState: 'normal'
    });
  }
  initiateBookIssue = async()=>{
    db.collection("transactions").add({
      'studentId':this.state.scannedStudentId,
      'bookId':this.state.scannedBookId,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transcationType':'issue'
    })
    db.collection("books").doc(this.state.scannedBookId).update({'bookAvailability':false});
    db.collection("students").doc(this.state.scannedStudentsId).update({'booksIssued':firebase.firestore.FieldValue.increment(1)});
    Alert.alert("Book Issued")
    this.setState({scannedBookId:'',scannedStudentId:''})
  }
  initiateBookReturn = async()=>{
    db.collection("transactions").add({
      'studentId':this.state.scannedStudentId,
      'bookId':this.state.scannedBookId,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transcationType':'return'
    })
    db.collection("books").doc(this.state.scannedBookId).update({'bookAvailability':true});
    db.collection("students").doc(this.state.scannedStudentsId).update({'booksIssued':firebase.firestore.FieldValue.increment(-1)});
    Alert.alert("Book Returned")
    this.setState({scannedBookId:'',scannedStudentId:''})
  }

  checkBookEligibility = async()=>{
    const bookRef = await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
    var isStudentEligible = ""
    if(studentRef.docs.length == 0){
      this.setState({
        scannedStudentId: '',
        scannedBookId: '',
      })
      isStudentEligible = falseAlert.alert("The student id doesn't exist in the database!")
    }
    else{
      studentRef.docs.map((doc))=>{
        var student = doc.data();
        if(student.numberOfBooksIssued < 2){
          isStudentEligible = true
        }
        else{
          isStudentEligible = false
          Alert.alert("The student has already issued 2 books!")
          this.setState({
            scannedStudentId: '',
            scannedBookId: '',
          })
        }
      }

    }
    return isStudentEligible
  }

  checkStudentEligibilityForReturn = async()=>{
    const transactionRef = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
    var isStudentEligible = ""
    transactionRef.docs.map((doc))=>{
      var lastBookTransaction = doc.data();
      if(lastBookTransaction.studentId === this.state.scannedStudentId){
        isStudentEligible = true
     }
     else {
       isStudentEligible = falseAlert.alert("The book wasn't issued by this student!")
       this.setState({
         scannedStudentId: '',
         scannedBookId: ''
       })
     }
    }
    return isStudentEligible
  }
  handleTransaction = async()=>{
    //verify if the student is eligible for book issue or return or none
           //student id exists in the database
           //issue : number of book issued < 2
           //issue: verify book availability
           //return: last transaction -> book issued by the student id
     var transactionType = await this.checkBookEligibility();
     console.log("Transaction Type", transactionType)
     if (!transactionType) {
       Alert.alert("The book doesn't exist in the library database!")
       this.setState({
         scannedStudentId: '',
         scannedBookId: ''
       })
     }

     else if(transactionType === "Issue"){
       var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
       if(isStudentEligible){
         this.initiateBookIssue()
         Alert.alert("Book issued to the student!")
       }
     }

     else{
       var isStudentEligible = await this.checkStudentEligibilityForReturn()
       if(isStudentEligible){
         this.initiateBookReturn()
         Alert.alert("Book returned to the library!")
       }
     }
   }
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const buttonState = this.buttonState.onPress
      const scanned = this.state.scanned;
      if (buttonState === "clicked" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <View style={styles.container}>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
            style={styles.submitButton}
            onpress={async()=>{this.handleTransaction()}}>
            <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        );
     
  const styles = StyleSheet.create({
    container : {
      flex : 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize : 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });