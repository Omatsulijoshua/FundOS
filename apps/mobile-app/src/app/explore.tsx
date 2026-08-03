import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';

export default function AiCoachScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'coach',
      text: 'Hello Joshua. I have audited your recent 6 executions. Your win rate is strong (56.2%), but I see a high revenge trading tendency (33% of trades opened within 10 minutes of a loss). How are you feeling about your risk management today?',
      time: '10:30 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const prompt = inputText.toLowerCase();
    setInputText('');

    // Trigger AI response simulation
    setTimeout(() => {
      let replyText = '';
      if (prompt.includes('revenge') || prompt.includes('loss') || prompt.includes('tilt')) {
        replyText = "When you hit a loss, your brain enters a fight-or-flight response. The urge to " +
          "recover funds immediately causes bad execution. I recommend a strict 30-minute cool-down " +
          "rule: shut down the trading terminal after any loss.";
      } else if (prompt.includes('sizing') || prompt.includes('lot') || prompt.includes('risk')) {
        replyText = "To maintain consistency, keep your risk per trade below 1.0% of your account size. " +
          "Varying lot sizes indicates emotional trading. Stick to 1-2 standard lot sizes.";
      } else if (prompt.includes('rules') || prompt.includes('daily') || prompt.includes('drawdown')) {
        replyText = "Your daily drawdown limit is $500. Currently, your maximum loss today was $110. You " +
          "are 100% compliant. Keep trading defensively!";
      } else {
        replyText = "I'm analyzing your market metrics. Focus on maintaining emotional control, " +
          "standardizing your lot size exposure, and honoring stop-loss targets.";
      }

      const coachMsg = {
        id: Math.random().toString(),
        sender: 'coach',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, coachMsg]);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      {/* Diagnostic Gauges header */}
      <View style={styles.diagnosticsHeader}>
        <Text style={styles.headerTitle}>AI Behavioral Audit</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gaugeScroll}>
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeLabel}>Win Rate</Text>
            <Text style={[styles.gaugeValue, { color: '#30D158' }]}>56%</Text>
            <Text style={styles.gaugeSub}>Optimal</Text>
          </View>
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeLabel}>Profit Factor</Text>
            <Text style={[styles.gaugeValue, { color: '#30D158' }]}>1.72</Text>
            <Text style={styles.gaugeSub}>Strong</Text>
          </View>
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeLabel}>Revenge Trading</Text>
            <Text style={[styles.gaugeValue, { color: '#FF453A' }]}>33%</Text>
            <Text style={styles.gaugeSub}>High warning</Text>
          </View>
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeLabel}>Consistency Score</Text>
            <Text style={[styles.gaugeValue, { color: '#0A84FF' }]}>78/100</Text>
            <Text style={styles.gaugeSub}>Good</Text>
          </View>
        </ScrollView>
      </View>

      {/* Chat messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((item) => (
          <View
            key={item.id}
            style={[
              styles.messageBubble,
              item.sender === 'user' ? styles.userBubble : styles.coachBubble,
            ]}>
            <Text
              style={[
                styles.bubbleText,
                item.sender === 'user' ? styles.userText : styles.coachText,
              ]}>
              {item.text}
            </Text>
            <Text style={styles.bubbleTime}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask coach about revenge trading, sizing..."
          placeholderTextColor="#8E8E93"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  diagnosticsHeader: {
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
    backgroundColor: '#0A0A0A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 20,
    marginBottom: 12,
  },
  gaugeScroll: {
    paddingLeft: 20,
  },
  gaugeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: 120,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  gaugeLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 4,
  },
  gaugeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gaugeSub: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: 4,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#0A84FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  coachBubble: {
    backgroundColor: '#1C1C1E',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userText: {
    color: '#FFFFFF',
  },
  coachText: {
    color: '#FFFFFF',
  },
  bubbleTime: {
    fontSize: 9,
    color: '#8E8E93',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
    backgroundColor: '#0A0A0A',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    marginRight: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  sendButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
