import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import { useObservable, pick } from '../../util/rxjs';
import useCore from '../../util/useCore';
import './index.css';

const Setting = ({ line = 3 }: { line: number }) => {
    const core = useCore();

    const members = useObservable(useMemo(() => core.pipe(pick('setting'), pick('members')), []), []);

    const lined = new Array(Math.ceil(members.length / line)).fill()
        .map((_, index) => index * line)
        .map(index => new Array(line).fill().map((_, offset) => index + offset)
            .filter(index => members[index] != null)
            .map(index => ({ ...members[index], index }))
            .map(({ name, ...member }) => {
                const disabled = name.startsWith('//');
                return { ...member, name: disabled ? name.slice(2) : name, disabled };
            })
        );

    useEffect(() => {
        core.setting();
        return core.pause;
    }, []);

    const [insert, setInsert] = useState({ name: '', gender: 'male', type: '其它' });

    if (!members.length) return <h3>LOADING</h3>;
    return (
        <div className="Setting">
            <div className="titleBar">
                <p id="save" onClick={() => {
                    const exported = members.reduce((dict, { name, gender, type }) => {
                        const genders = dict[type] || {};
                        const members = genders[gender] || [];
                        return { ...dict, [type]: { ...genders, [gender]: [...members, name] } };
                    }, {});
                    console.info('保存配置：', exported); // eslint-disable-line no-console
                    const file = new Blob([JSON.stringify(exported, undefined, '    ')], { type: 'text/plain' });
                    const save = document.createElement('a');
                    save.download = 'config.SECRET.json';
                    save.href = URL.createObjectURL(file);
                    save.click();
                }}>保存</p>
                <div id="insert">
                    <input className="name" value={insert.name} placeholder="姓名" onChange={({ target: { value } }) => setInsert({ ...insert, name: value.trim() })} />
                    <select value={insert.gender} onChange={({ target: { value } }) => setInsert({ ...insert, gender: value })}>
                        <option value="male">帅哥</option>
                        <option value="female">美女</option>
                    </select>
                    <select value={insert.type} onChange={({ target: { value } }) => setInsert({ ...insert, type: value })}>
                        <option value="其它">其它</option>
                        <option value="特殊">特殊</option>
                        <option value="美术">美术</option>
                    </select>
                    <span id="commit" onClick={() => {
                        if (!insert.name) return;
                        setInsert({ name: '', gender: 'male', type: '其它' });
                        core.updateMember(members.length, insert);
                    }}>插入</span>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        {new Array(line).fill().map((_, index) => (
                            <TableHead key={index} index={index}>
                                <th>姓名</th>
                                <th>性别</th>
                                <th>类别</th>
                                <th>禁用</th>
                            </TableHead>
                        ))}
                    </tr>
                </thead>
                <tbody>{lined.map((members, index) => (
                    <tr key={index}>{members.map(({ index, name, gender, type, disabled }) => (
                        <TableMember key={index} index={index}>
                            <td>
                                <input className="name" value={name} onChange={({ target: { value } }) => core.updateMember(index, { name: value.trim() })} />
                            </td>
                            <td>
                                <select value={gender} onChange={({ target: { value } }) => core.updateMember(index, { gender: value })}>
                                    <option value="male">帅哥</option>
                                    <option value="female">美女</option>
                                </select>
                            </td>
                            <td>
                                <select value={type} onChange={({ target: { value } }) => core.updateMember(index, { type: value })}>
                                    <option value="其它">其它</option>
                                    <option value="特殊">特殊</option>
                                    <option value="美术">美术</option>
                                </select>
                            </td>
                            <td>
                                <input type="checkbox" checked={disabled} onChange={({ target: { checked } }) => core.updateMember(index, { name: `${checked ? '//' : ''}${name}` })} />
                            </td>
                        </TableMember>
                    ))}</tr>
                ))}</tbody>
            </table>
        </div>
    );
};
export default Setting;

type TableProps = {
    index: number,
    children: ReactNode,
};
const TableHead = ({ children }: TableProps) => (
    <>
        <th>#</th>
        {children}
        <th className="padding"></th>
    </>
);
const TableMember = ({ index, children }: TableProps) => (
    <>
        <td>{`00${1 + index}`.slice(-3)}</td>
        {children}
        <td className="padding"></td>
    </>
);
