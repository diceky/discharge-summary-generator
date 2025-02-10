import React, { useState, useEffect, useRef } from 'react';
import { Circles } from 'react-loader-spinner'
import './Styles.css'
import { BookOpen } from 'feather-icons-react';
import Markdown from 'react-markdown'
import {patient1} from '../assets/MIMIC';
import {patient2} from '../assets/MIMIC';
import {patient3} from '../assets/MIMIC';
import {patient4} from '../assets/MIMIC';

const Generator = () => {

  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [waitingSource, setWaitingSource] = useState(false);
  const [waitingRequest, setWaitingRequest] = useState(false);
  const [summary, setSummary] = useState("");
  const [request, setRequest] = useState("");
  const [source, setSource] = useState({ rational: "", source: "" });
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [style, setStyle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [preference, setPreference] = useState([
    {
      "name":"Literalness",
      "value":"Medium",
    },
    {
      "name":"Conciseness",
      "value":"Medium",
    },
  ]);
  const [isEditing, setIsEditing] = useState(true);

  const messages = useRef(new Array());
  const textareaRef = useRef();

  const systemPrompt = `
    You are a helpful medical advisor. 
    Follow the instructions and provide responses to the best of your knowledge. 
  `

  useEffect(() => {
    return () => {//cleanup code

    }
  }, []);

  const handleNewInput = (e) => {
    setInput(e.target.value);
  }

  const handleSummaryEdit = (e) => {
    setSummary(e.target.value);
  }

  const handleRequest = (e) => {
    setRequest(e.target.value);
  }

  const handleStyle = (e) => {
    setStyle(e.target.value);
  }

  const handleSummarize = async () => {
    setWaiting(true);

    const prompt = `
      You will be provided with patient records and notes. 
      Create a concise summary of the patient in the following format: 

      **Subject ID**  \n
      10000117
      
      **Admission Date**  \n
      2181-11-15

      **Discharge Date**  \n
      2181-11-15
      
      **Date of birth**  \n
      Date of birth
      
      **Sex**  \n
      Sex

      **Service**  \n
      Service

      **Allergies**  \n
      Allergies
      
      **Chief complaint**  \n
      Chief complaint

      **Major Surgical or Invasive Procedure**  \n
      Major Surgical or Invasive Procedure
      
      **History of Present Illness**  \n
      History of present illness, in bullet points
      
      **RA Imaging showed**  \n
      RA Imaging showed
      
      **Consults**  \n
      Consults
      
      **Past Medical History**  \n
      Past medical history, in bullet points
      
      **Social History**  \n
      Social history, in bullet points

      **Family History**  \n
      Family history, in bullet points

      **Physical Exam results**  \n
      Physical exam results, in bullet points
      
      **Pertinent Results**  \n
      Pertinent results
      
      **Medications on Admission**  \n
      Medications on admission, in bullet points
      
      **Discharge Medications**  \n
      Discharge medications, in bullet points
      
      **Discharge Disposition**  \n
      Discharge disposition
      
      **Discharge Diagnosis**  \n
      Discharge diagnosis
      
      **Discharge Instructions**  \n
      Discharge instructions, in bullet points

      This is the patient records and notes to use as input: ${input}
      
      Provide your response in the following format, do not wrap the json codes in JSON markers:
      
      {
        "summary": "your summary here"
      }
    `

    messages.current = []; //reset the messags array first
    messages.current.push(
      {
        "role": "system",
        "content": [
          {
            "type": "text",
            "text": systemPrompt
          }
        ]
      },
    );
    messages.current.push({
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": prompt
        }
      ]
    });
    const endpoint = `${import.meta.env.VITE_SERVER_ENDPOINT}/getResponse`;
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messages.current,
        })
      })
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          console.log(response);
          setSummary(JSON.parse(response).summary);
          setWaiting(false);
          messages.current.push({
            "role": "assistant",
            "content": [
              {
                "type": "text",
                "text": response
              }
            ]
          });
          console.log(messages.current);
        });
    } catch (error) {
      console.error(error);
    }
  }

  const handleReset = () => {
    setSummary("");
    setInput("");
    messages.current = [];
  }

  const fetchRationaleAndSource = async (selectedText) => {
    setWaitingSource(true);

    const prompt = `
      Explain your rationale for the following section of the summary.

      Provide your response in the following format:
      
      {
        "rationale": "A short rationale for how you retrieved this information. Respond in Markdown formatting, highlighting particularly important words or sentences with bold or italics.",
        "source": "the original sentence you referred to from the input text",
      }

      Section to provide rationale: ${selectedText}
    `;

    messages.current.push({
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": prompt
        }
      ]
    });

    const endpoint = `${import.meta.env.VITE_SERVER_ENDPOINT}/getResponse`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messages.current,
        })
      });
      const data = await response.json();
      setSource(JSON.parse(data));
      setWaitingSource(false);
      messages.current.push({
        "role": "assistant",
        "content": [
          {
            "type": "text",
            "text": data
          }
        ]
      });
      console.log(messages.current);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMouseUpEditMode = () => {
    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;

    if (selectionStart !== selectionEnd) {
      const selectedText = textarea.value.substring(selectionStart, selectionEnd);

      const rect = textarea.getBoundingClientRect();
      const lineHeight = 20; // Assuming 20px line-height

      // Calculate row and column of the selection start
      const cols = textarea.cols;
      const row = Math.floor(selectionStart / cols);
      const col = selectionStart % cols;

      // Calculate the position
      const x = rect.left + window.scrollX + col * (14 * 0.1); // Approximate char width
      const y = rect.top + window.scrollY + row * lineHeight;

      setTooltip({
        show: true,
        text: selectedText,
        x: x - 600,
        y: y - 400, // Position tooltip above the selection
      });

      fetchRationaleAndSource(selectedText);

    } else {
      setRequest(""); // reset text in Request
      setExplanation(""); // reset explanation for the Request
      setTooltip({ show: false, text: '', x: 0, y: 0 });
    }

  };

  const handleMouseUpPreviewMode = (e) => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const x = rect.left + window.scrollX - 700;
      const y = rect.top + window.scrollY - 400;
      setTooltip({
        show: true,
        x,
        y,
        text: selection.toString()
      });

      fetchRationaleAndSource(selection.toString());

    } else {
      setRequest(""); // reset text in Request
      setExplanation(""); // reset explanation for the Request
      setTooltip({ show: false, x: 0, y: 0, text: '' });
    }
  };


  const handleSendRequest = async () => {
    setWaitingRequest(true);

    const prompt = `
      Update the specified section of the generated summary based on the following request.
      Specified section: ${tooltip.text}
      Requst: ${request}

      The user may have edited the summary that you generated, so I am providing you witht the newest version of the summary as well.
      Newest version of the summary: ${summary}

      Write the summary in the same writing style as the following reference.
      Deliberately mimic the user's lexical and syntactic styles, i.e. their choice of words, vocabulary,grammar and sentence structures, to match the given writing style.
      Writing style reference: ${style}

      Provide your response in the following format:
      
      {
        "summary": "the updated summary here",
        "explanation": "Provide a short explanation of the update in the following format:\n\n## Before\nThe patient presented with severe abdominal pain and nausea.\n\n## After\nThe patient *exhibited acute epigastric pain accompanied by persistent nausea* (highlight the part that you added or updated in bold).\n\n## Explanation\nUpdated to use more precise medical terminology and provide a clearer description of symptoms location."
      }
    `
    messages.current.push({
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": prompt
        }
      ]
    });
    const endpoint = `${import.meta.env.VITE_SERVER_ENDPOINT}/getResponse`;
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messages.current,
        })
      })
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          setSummary(JSON.parse(response).summary)
          setExplanation(JSON.parse(response).explanation);
          setWaitingRequest(false);
          // console.log(response);
          messages.current.push({
            "role": "assistant",
            "content": [
              {
                "type": "text",
                "text": response
              }
            ]
          });
          console.log(messages.current);
        });
    } catch (error) {
      console.error(error);
    }
  }

  const handlePreference = (e, index) => {
    const tempPreference = [...preference];
    tempPreference[index].value = e.target.innerText;
    setPreference(tempPreference);
  }

  const handleArticle = (e) => {
    if (e.target.innerText === "Patient 1") setInput(patient1);
    else if (e.target.innerText === "Patient 2") setInput(patient2);
    else if (e.target.innerText === "Patient 3") setInput(patient3);
    else if (e.target.innerText === "Patient 4") setInput(patient4);
  }

  const toggleEditMode = () => {
  const outputWrapper = document.querySelector('.outputWrapper');
  const scrollPosition = outputWrapper.scrollTop;
  setIsEditing(!isEditing);
  setTimeout(() => {
    outputWrapper.scrollTop = scrollPosition;
  }, 0);
};

  return (
    <>
      <div className="summaryWrapper">
        <div className="responseWrapper input">
          <h3 className="responseTitle">{"Input information"}</h3>
          <div className="articlesWrapper">
                <button className="article" onClick={(e) => handleArticle(e)}>Patient 1</button>
                <button className="article" onClick={(e) => handleArticle(e)}>Patient 2</button>
                <button className="article" onClick={(e) => handleArticle(e)}>Patient 3</button>
                <button className="article" onClick={(e) => handleArticle(e)}>Patient 4</button>
              </div>
            <>
              <textarea className="summaryInput" value={input} placeholder='text to summarize...' onChange={(e) => handleNewInput(e)} />
              <div className="buttonWrapper">
                <button className="button blue" onClick={handleSummarize}>Generate</button>
              </div>
            </>
        </div>
        
        <div className="responseWrapper output">
          <h3 className="responseTitle">Discharge summary</h3>
          {waiting && (
            <Circles
              height="60"
              width="60"
              color="#01168F"
              ariaLabel="loading"
              wrapperClass="spinner"
            />
          )}
          {!waiting && summary &&
          <>
          <div className="articlesWrapper">
            <button className="article" onClick={toggleEditMode}>
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          </div>
            <div className="outputWrapper">
              {isEditing ? (
                <textarea
                  className="summaryOutput"
                  value={summary}
                  placeholder='text to summarize...'
                  onChange={handleSummaryEdit}
                  onMouseUp={handleMouseUpEditMode}
                  ref={textareaRef}
                  cols="100"
                />
              ) : (
                <div className="summaryOutput" onMouseUp={handleMouseUpPreviewMode}>
                  <Markdown>{summary}</Markdown>
                </div>
              )}
              {tooltip.show && (
                <div className="tooltip"
                  style={{
                    top: tooltip.y,
                    left: tooltip.x,
                  }}
                >
                  {/* <div className="tooltip-section">
                      {tooltip.text}
                    </div> */}
                  <div className="tooltip-section">
                    <p className="tooltip-title">Source</p>
                    {waitingSource && (
                      <Circles
                        height="24"
                        width="24"
                        color="#01168F"
                        ariaLabel="loading"
                        wrapperClass="spinner"
                      />
                    )}
                    {!waitingSource &&
                      <>
                        <Markdown className="followup-answer">{source.rationale}</Markdown>
                        <p className="source pro"><BookOpen className="icon-book" size={24} />{source.source}</p>
                      </>
                    }
                  </div>
                  {/* <div className="tooltip-section">
                    <p className="tooltip-title">Request</p>
                    <div className="addFollowup summary">
                        <textarea className="followup summary" value={request} placeholder='Write your request...' onChange={(e) => handleRequest(e)} />
                        <button className="sendNewFollowup"onClick={() => handleSendRequest()}>Send</button>
                    </div>
                    {waitingRequest && (
                      <Circles
                        height="24"
                        width="24"
                        color="#01168F"
                        ariaLabel="loading"
                        wrapperClass="spinner"
                      />
                    )}
                    {explanation && <Markdown className="followup-answer">{explanation}</Markdown>}
                  </div> */}
                </div>
              )}
            </div>
            </>
          }
        </div>

      </div>

      {!waiting && summary &&
        <div className="buttonWrapper">
          <button className="button" onClick={handleReset}>Reset</button>
        </div>
      }
    </>
  )
}

export default Generator;